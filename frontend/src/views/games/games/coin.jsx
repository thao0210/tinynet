import React, { useEffect, useState} from "react";
import { motion } from "framer-motion";
import classes from '../styles.module.scss';
import { useStore } from '@/store/useStore';
import FlyPoint from "@/components/flyPoints";
import { YourPoints } from "./components";
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';
import Tippy from "@tippyjs/react";
import star from '@/assets/star.svg';

const CoinFlipGame = () => {
  const [result, setResult] = useState(null);
  const [prevScore, setPrevScore] = useState(0);
  const [score, setScore] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [outcomes, setOutcomes] = useState(null);

  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState({ plus: "", minus: "" });
  const [isCustomActive, setIsCustomActive] = useState(false);

  const { user, setUser } = useStore();
  const updateUserPoints = useUpdateUserPoints();

  const playCost = -5;
  const customCost = -50;

  const isNumber = (val) => typeof val === "number" || !isNaN(Number(val));
  const getFontSize = (value) => {
  if (isNumber(value)) return "28px"; // số thì to, mặc định
  const length = value.length;

  if (length <= 6) return "24px";
  if (length <= 10) return "20px";
  if (length <= 15) return "16px";
  return "12px"; // quá dài thì thu nhỏ tối đa
};

  const generateOutcomes = () => {
    const minus = -Math.floor(Math.random() * 100);
    const plus = Math.floor(Math.random() * 100);
    setOutcomes({ minus, plus });
    setCustomMode(false);
    setResult(null);
  };

  const handleCustomCoin = () => {
    if (score < 50) {
      alert("Not enough points to use custom coin.");
      return;
    }

    setCustomMode(true);
    setResult(null);
  };

  const applyCustomText = () => {
    const newScore = score + customCost;
    setPrevScore(score);
    setScore(newScore);
    setUser({ ...user, userPoints: newScore });
    updateUserPoints(customCost, "Custom Coin Feature");
    setOutcomes({ plus: customText.plus, minus: customText.minus });
    setIsCustomActive(true);
    setCustomMode(false);
  };

  const flipCoin = () => {
    if (score < Math.abs(playCost)) {
      alert("Not enough points to flip the coin.");
      return;
    }

    const currentScoreAfterCost = score + playCost;
    setIsFlipping(true);
    setPrevScore(score);
    setScore(currentScoreAfterCost);

    setTimeout(() => {
      const options = [outcomes.minus, outcomes.plus];
      const randomResult = options[Math.floor(Math.random() * 2)];
      const pointChange = typeof randomResult === "number" ? randomResult : 0;

      const finalScore = currentScoreAfterCost + pointChange;
      setResult(randomResult);
      setScore(finalScore);
      setPrevScore(currentScoreAfterCost);
      setIsFlipping(false);

      setTimeout(() => {
        setUser({ ...user, userPoints: finalScore });
        if (!isCustomActive) generateOutcomes();
        updateUserPoints(playCost + pointChange, "Coin Flip Result");
      }, 2000);
    }, 1500);
  };

  useEffect(() => {
    generateOutcomes();
    if (user && typeof user.userPoints === "number") {
      setScore(user.userPoints);
      setPrevScore(user.userPoints);
    }
  }, []);

  return (
    <div className={classes.coinsGame}>
      <div className={classes.gradientBg}>
      <h1>Coin Flip Game</h1>
      <div className={classes.flex}>
        <div className={classes.relative}>
          <div className={classes.tabs}>
            <Tippy content="Generate two random coin values">
              <button onClick={generateOutcomes} className={customMode ? 'btn sub' : 'btn main2'}>
                Random Sides
              </button>
            </Tippy>
            <Tippy content="Create your own labels for the coin (-50 stars)">
              <button onClick={handleCustomCoin} className={!customMode ? 'btn sub' : 'btn main2'}>
                Custom Sides
              </button>
            </Tippy>
          </div>

          {customMode && (
            <div className={classes.customForm}>
              <div>
              <label>
                Positive Face
              </label>
                <input
                  type="text"
                  maxLength={35}
                  value={customText.plus}
                  onChange={(e) =>
                    setCustomText({ ...customText, plus: e.target.value })
                  }
                />
              </div>
              <div>
              <label>
                Negative Face
              </label>
                <input
                  type="text"
                  maxLength={35}
                  value={customText.minus}
                  onChange={(e) =>
                    setCustomText({ ...customText, minus: e.target.value })
                  }
                />
              </div>
              <button className="btn" onClick={applyCustomText} disabled={!(customText.plus && customText.minus)}>
                Apply
                <span className="price">-50 <img src={star} alt="stars" width={20} /></span>
              </button>
            </div>
          )}

          {outcomes && (
            <div className={classes.coin}>
              <div className={classes.plus} style={{ fontSize: getFontSize(outcomes.plus) }}>{outcomes.plus}</div>
              <div className={classes.minus} style={{ fontSize: getFontSize(outcomes.minus) }}>{outcomes.minus}</div>
            </div>
          )}

          <YourPoints prevScore={prevScore} score={score} />
          {result && !isFlipping && !customMode && <FlyPoint point={result} />}
        </div>

        {outcomes && (
          <div className={classes.flipBox}>
            <motion.div
              animate={{
                rotateX: isFlipping ? 1440 : 0,
                y: isFlipping ? [0, -220, 0] : 0,
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className={classes.flip}
            >
              <span style={{ fontSize: getFontSize(outcomes.plus) }}>{isFlipping ? "?" : result}</span>
            </motion.div>
            <button className="btn" onClick={flipCoin}>
              Flip Coin
              <span className="price">-5 <img src={star} alt="stars" width={20} /></span>
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CoinFlipGame;