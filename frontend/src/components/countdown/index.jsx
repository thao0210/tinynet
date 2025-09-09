// components/CountdownTimer.js
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import classes from './styles.module.scss';
import { numberWith0 } from '@/utils/numbers';
import Loader from '../loader';
import { useVote } from '@/contexts/voteContext';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export const CountdownDateTime = ({ deadline, userTimezone, setShowResults }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const voteCtx = useVote();
  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs().tz(userTimezone);
      const end = dayjs(deadline).tz(userTimezone);
      const diff = end.diff(now, 'second');

      if (diff <= 0) {
        setTimeLeft("Timeout");
        clearInterval(interval);
        setShowResults && setShowResults(true);
        voteCtx?.setIsTimeout?.(true);
        return;
      }

      const duration = dayjs.duration(diff * 1000);
      setTimeLeft(`${duration.days() > 0 ? duration.days() + ' days' : ''} ${numberWith0(duration.hours())} : ${numberWith0(duration.minutes())} : ${numberWith0(duration.seconds())}`);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [deadline, userTimezone]);

  return (
    <div className={classes.timeLeft}>
      <span>Time left</span>
      <div>
      {
        !timeLeft ? <Loader isSmall color='#ccc' /> : timeLeft
      }
      </div>
    </div>
  );
}

const CountdownTimer = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete && onComplete();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return <span>{formatTime(timeLeft)}</span>;
};

export default CountdownTimer;
