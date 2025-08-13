import classes from '../styles.module.scss';
import React, { useState, useEffect, useRef } from "react";
import { YourPoints } from './components';
import FlyPoint from '@/components/flyPoints';
import { useStore } from '@/store/useStore';
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';

const generateRandomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const FastTypingGame = () => {
  const [word, setWord] = useState("");
  const [input, setInput] = useState("");
  const [length, setLength] = useState(5); // Start with 5 characters
  const [timer, setTimer] = useState(5);
  const [startTime, setStartTime] = useState(null);
  const [count, setCount] = useState(0); // Correct streak
  const [isTyping, setIsTyping] = useState(false);
  const [isGameActive, setIsGameActive] = useState(true);

  const intervalRef = useRef(null);
  const updateUserPoints = useUpdateUserPoints();
  const { user, setUser } = useStore();

  const [result, setResult] = useState(null);
  const [prevScore, setPrevScore] = useState(0);
  const [score, setScore] = useState(0);

  // Start: init score + generate word
  useEffect(() => {
    generateNewWord(length);
    if (user && typeof user.userPoints === "number") {
      setScore(user.userPoints);
      setPrevScore(user.userPoints);
    }
  }, []);

  // Start timer when first character typed
  useEffect(() => {
    if (input.length === 1 && !startTime) {
      setStartTime(Date.now());
      startCountdown();
      setIsTyping(true);
    }
  }, [input]);

  const startCountdown = () => {
    let timeLeft = length;
    setTimer(timeLeft);
    intervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        handleTimeout();
      }
    }, 1000);
  };

  const generateNewWord = (len) => {
    const newWord = generateRandomString(len);
    setWord(newWord);
    setInput("");
    setStartTime(null);
    setTimer(len);
    setIsTyping(false);
    setIsGameActive(true);
  };

  const handleTimeout = () => {
    const penalty = -20;
    setResult(penalty);
    const newScore = score + penalty;
    setPrevScore(score);
    setScore(newScore);
    setCount(0);
    setIsGameActive(false);
    updateUserPoints(penalty, "Fast Typing Timeout");
    generateNewWord(length);
  };

  const checkTyping = () => {
    if (!isGameActive) return;

    clearInterval(intervalRef.current);
    setIsGameActive(false);

    const elapsedTime = (Date.now() - startTime) / 1000;
    let deltaPoints = 0;
    let newScore;
    if (input === word) {
      if (elapsedTime <= 1) deltaPoints = 80;
      else if (elapsedTime <= 2) deltaPoints = 40;
      else if (elapsedTime <= 3) deltaPoints = 20;
      else if (elapsedTime <= 4) deltaPoints = 10;
      else if (elapsedTime <= 5) deltaPoints = 5;

      setResult(deltaPoints);
      newScore = score + deltaPoints;
      setPrevScore(score);
      setScore(newScore);

      const newCount = count + 1;
      setCount(newCount);
      if (newCount % 5 === 0) {
        setLength((prev) => prev + 1); // increase difficulty
      }
    } else {
      deltaPoints = -5 * length;
      setResult(deltaPoints);
      newScore = score + deltaPoints;
      setPrevScore(score);
      setScore(newScore);
      setCount(0);
    }

    updateUserPoints(deltaPoints, "Fast Typing Result");
    setUser({ ...user, userPoints: newScore });
    generateNewWord(length);
  };

  return (
    <div className={classes.fastTyping}>
      <h1>Fast Typing Game</h1>

      <div className={classes.timer}>
        <label>Time left</label>
        <span>{timer}s</span>
      </div>

      <div className={classes.word}>
        Type this word
        <div>
          {word.split("").map((char, index) => (
            <span key={`char${index}`}>{char}</span>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && checkTyping()}
        className={classes.input}
        autoFocus
      />

      <div className={classes.relative}>
        <YourPoints prevScore={prevScore} score={score} />
        {result && !isTyping && <FlyPoint point={result} />}
      </div>
    </div>
  );
};

export default FastTypingGame;