import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './lottery.module.scss';
import { YourPoints } from './components';
import FlyPoint from '@/components/flyPoints';
import classes from '../styles.module.scss';
import { useStore } from '@/store/useStore';
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';
import star from '@/assets/star.svg';

const generateRandomNumbers = () => {
  const nums = new Set();
  while (nums.size < 6) {
    nums.add(Math.floor(Math.random() * 10));
  }
  return [...nums];
};

const calculatePoints = (userNumbers, resultNumbers) => {
  let maxStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < 6; i++) {
    if (userNumbers[i] === resultNumbers[i]) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  switch (maxStreak) {
    case 6: return 2000;
    case 5: return 500;
    case 4: return 200;
    case 3: return 100;
    case 2: return 50;
    case 1: return 10;
    default: return 0;
  }
};

const LuckyNumberGame = () => {
  const [userNumbers, setUserNumbers] = useState(Array(6).fill(''));
  const [resultNumbers, setResultNumbers] = useState(Array(6).fill(null));
  const [isRolling, setIsRolling] = useState(false);
  const [rollingIndex, setRollingIndex] = useState(-1);
  const [prevScore, setPrevScore] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  const { user, setUser } = useStore();
  const updateUserPoints = useUpdateUserPoints();

  const inputRefs = useRef([]);
  const playCost = -5;

  useEffect(() => {
    if (user && typeof user.userPoints === "number") {
      setScore(user.userPoints);
      setPrevScore(user.userPoints);
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (!isNaN(value) && value.length <= 1) {
      const updated = [...userNumbers];
      updated[index] = value;
      setUserNumbers(updated);

      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const rollNumbers = async () => {
    if (score < Math.abs(playCost)) {
      alert("Not enough points to spin numbers.");
      return;
    }

    if (userNumbers.some(num => num === '')) {
      alert('Please enter all numbers!');
      return;
    }

    // Trừ điểm trước
    const currentScoreAfterCost = score + playCost;
    setPrevScore(score);
    setScore(currentScoreAfterCost);

    setIsRolling(true);
    const finalResult = generateRandomNumbers();
    const animatedResult = [...Array(6).fill(null)];

    for (let i = 0; i < 6; i++) {
      setRollingIndex(i);
      await new Promise(resolve => setTimeout(resolve, 500));
      animatedResult[i] = finalResult[i];
      setResultNumbers([...animatedResult]);
    }

    setRollingIndex(-1);

    const intUserNumbers = userNumbers.map(num => parseInt(num));
    const value = calculatePoints(intUserNumbers, finalResult);
    setResult(value);

    const newScore = currentScoreAfterCost + value;
    setPrevScore(currentScoreAfterCost);
    setScore(newScore);
    setIsRolling(false);

    setTimeout(() => {
      setUser({ ...user, userPoints: newScore });
      updateUserPoints(value + playCost, "Lucky Number Result");
    }, 2000);
  };

  const getRollingSpan = () => {
    const candidates = Array.from({ length: 10 }, (_, i) => i);
    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
  };

  const disabled = userNumbers.some(num => num === '');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lucky Number Game</h1>

      <label>Add 6 numbers</label>
      <div className={styles.inputGroup}>
        {userNumbers.map((num, i) => (
          <input
            key={i}
            type="text"
            value={num}
            onChange={e => handleInputChange(i, e.target.value)}
            className={styles.inputBox}
            maxLength={1}
            ref={el => inputRefs.current[i] = el}
          />
        ))}
      </div>

      <button
        onClick={rollNumbers}
        disabled={isRolling || disabled}
        className={`btn ${styles.button}`}
      >
        {isRolling ? 'Rolling...' : 'Spin Numbers'}
        <span className="price">-5 <img src={star} alt="stars" width={20} /></span>
      </button>

      <div className={styles.resultGroup}>
        {resultNumbers.map((num, i) => (
          <div key={i} className={styles.resultBox}>
            <AnimatePresence mode="wait">
              {rollingIndex === i ? (
                <motion.span
                  key={`rolling-${i}-${Math.random()}`}
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {getRollingSpan()}
                </motion.span>
              ) : (
                <motion.span
                  key={`final-${i}-${num}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {num !== null ? num : '-'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className={classes.relative}>
        <YourPoints prevScore={prevScore} score={score} />
        {result > 0 && !isRolling && <FlyPoint point={result} />}
      </div>
    </div>
  );
};

export default LuckyNumberGame;
