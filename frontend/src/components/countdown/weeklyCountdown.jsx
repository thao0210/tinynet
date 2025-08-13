import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { numberWith0 } from '@/utils/numbers';
import classes from "./styles.module.scss";

function WeeklyChampionCountdown({ nextReset, week }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(nextReset);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) return setTimeLeft("Đang trao giải...");

      const duration = dayjs.duration(diff);
      setTimeLeft(`${duration.days() > 0 ? duration.days() + ' days' : ''} ${numberWith0(duration.hours())} : ${numberWith0(duration.minutes())} : ${numberWith0(duration.seconds())}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextReset]);

  return (
    <h2 className={classes.time}>
      <span>Week {week}</span>
      {timeLeft}
    </h2>
  );
}

export default WeeklyChampionCountdown;
