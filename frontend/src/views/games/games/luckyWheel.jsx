import React, { useRef, useState, useEffect } from "react";
import { hexToRGBA } from "@/utils/color";
import classes from '../styles.module.scss';
import { YourPoints } from "./components";
import classNames from "classnames";
import star from '@/assets/star.svg';
import { useStore } from '@/store/useStore';
import FlyPoint from "@/components/flyPoints";
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';
import Tippy from '@tippyjs/react';
import Modal from '@/components/modal';

const colors = ["#febb14", "#f25727"];
const MAX_CHAR = 20;

function LuckyWheel({ onFinish }) {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [lightIndex, setLightIndex] = useState(0);
  const animationRef = useRef(null);
  const [prevScore, setPrevScore] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [segments, setSegments] = useState([]);
  const [jackpot, setJackpot] = useState(200);
  const {user, setUser} = useStore();
  const updateUserPoints = useUpdateUserPoints();
  const [customMode, setCustomMode] = useState(false);
  const [customSegments, setCustomSegments] = useState(Array(8).fill(""));

  const getFontSize = (text) => {
    if (text.length <= 6) return "bold 23px sans-serif";
    if (text.length <= 10) return "bold 18px sans-serif";
    if (text.length <= 15) return "bold 14px sans-serif";
    return "bold 12px sans-serif";
  };

  const spinWheel = () => {
    if (isSpinning || score < 10) return;
    const newScore = score - 10;
    setPrevScore(score);
    setScore(newScore);
    setUser({ ...user, userPoints: newScore });
    updateUserPoints(-10, "Spin Cost");

    setIsSpinning(true);
    const segmentAngle = 360 / segments.length;
    const randomIndex = Math.floor(Math.random() * segments.length);
    const spinAngle = 360 * 5 + (360 - randomIndex * segmentAngle - segmentAngle / 2);
    const duration = 4000;
    const start = performance.now();
    const initialAngle = angle;

    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const easing = 1 - Math.pow(1 - progress, 3);
      const currentAngle = initialAngle + spinAngle * easing;

      setAngle(currentAngle);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationRef.current);
        const finalAngle = (initialAngle + spinAngle) % 360;
        const normalizedAngle = (360 - (finalAngle % 360) + segmentAngle / 2) % 360;
        const selected = Math.floor(normalizedAngle / segmentAngle);

        onFinish?.(segments[selected]);
        // const value = typeof segments[selected] === "number" ? segments[selected] : jackpot;
        const value = segments[selected] === 'JACKPOT' ? jackpot : segments[selected];
        setResult(value);
        if (typeof value === "number") {
          const newScore = score + value;
          setPrevScore(score);
          setScore(newScore);
          setTimeout(() => {
            setUser({ ...user, userPoints: newScore });
            generateOutcomes();
            updateUserPoints(value, "Lucky Wheel Result");
          }, 2000);
        }
        
        setIsSpinning(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const generateOutcomes = () => {
    const random = Math.round(Math.random()*7);
    const array = [
      -Math.floor(Math.random()*100),
      Math.floor(Math.random()*100),
      -Math.floor(Math.random()*100),
      -Math.floor(Math.random()*100),
      Math.floor(Math.random()*100),
      Math.floor(Math.random()*100),
      -Math.floor(Math.random()*100)
    ];
    array.splice(random, 0, 'JACKPOT');
    setJackpot(100*Math.round(Math.random()*5 + 1));
    setSegments(array);
    setCustomMode(false);
  }

  const applyCustomSegments = () => {
    const sanitized = customSegments.map(text =>
      text.trim().slice(0, MAX_CHAR) || "0"
    );
    setSegments(sanitized);
    setCustomMode(false);
    setResult(null);
    updateUserPoints(-50, "Custom Lucky Wheel");
    setUser({ ...user, userPoints: score - 50 });
    setScore(score - 50);
  };

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext("2d");
  //   const size = 380;
  //   const radius = size / 2;
  //   canvas.width = size;
  //   canvas.height = size;

  //   ctx.clearRect(0, 0, size, size);
  //   ctx.save();
  //   ctx.translate(radius, radius);
  //   ctx.rotate((angle * Math.PI) / 180);

  //   const arc = (2 * Math.PI) / segments.length;

  //   ctx.beginPath();
  //   ctx.arc(0, 0, 220, 0, 2 * Math.PI);
  //   ctx.fillStyle = "#bf1f1f";
  //   ctx.fill();

  //   segments.forEach((label, i) => {
  //     ctx.beginPath();
  //     const color = label === 'JACKPOT' ? '#bf1f1f' : colors[i % colors.length];
  //     const centerX = 0;
  //     const centerY = 0;
  //     const innerRadius = 0;
  //     const outerRadius = radius - 20;
  //     const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
  //     const rgbaBase = hexToRGBA(color);
  //     gradient.addColorStop(0, `${rgbaBase(0.5)}`);
  //     gradient.addColorStop(1, `${rgbaBase(1.0)}`);
  //     ctx.fillStyle = gradient;
  //     ctx.moveTo(0, 0);
  //     ctx.arc(0, 0, radius - 20, arc * i, arc * (i + 1));
  //     ctx.lineTo(0, 0);
  //     ctx.fill();

  //     ctx.save();
  //     ctx.strokeStyle = "#fff";
  //     ctx.lineWidth = 4;
  //     ctx.stroke();
  //     ctx.rotate(arc * i + arc / 2);
  //     ctx.translate(label === 'JACKPOT' ? radius - 70 : radius - 80, 0);
  //     ctx.rotate(Math.PI / 2);
  //     ctx.fillStyle = label === 'JACKPOT' ? 'yellow' : "#fff";
  //     ctx.font = getFontSize(label.toString());
  //     ctx.textAlign = "center";
  //     ctx.strokeStyle = "#000";
  //     ctx.lineWidth = 1;
  //     ctx.strokeText(label, 0, 0);
  //     ctx.fillText(label, 0, 0);
  //     ctx.restore();
  //   });

  //   ctx.restore();

  //   const ledCount = 30;
  //   const ledRadius = 4;
  //   const ledAngle = (2 * Math.PI) / ledCount;
  //   for (let i = 0; i < ledCount; i++) {
  //     const r = radius - 10;
  //     const x = radius + r * Math.cos(ledAngle * i);
  //     const y = radius + r * Math.sin(ledAngle * i);
  //     ctx.beginPath();
  //     ctx.arc(x, y, ledRadius, 0, 2 * Math.PI);
  //     ctx.fillStyle = i % 2 === lightIndex % 2 ? "#f55555" : "#ffffff";
  //     ctx.fill();
  //   }

  //   ctx.beginPath();
  //   ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
  //   ctx.lineWidth = 4;
  //   ctx.strokeStyle = "#fff";
  //   ctx.stroke();
  // }, [angle, lightIndex, segments]);
  useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const maxSize = 380;
  const padding = 40;
  const size = Math.min(window.innerWidth - padding, maxSize);
  const radius = size / 2;

  canvas.width = size;
  canvas.height = size;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate((angle * Math.PI) / 180);

  const arc = (2 * Math.PI) / segments.length;

  // Vẽ nền tròn
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#bf1f1f";
  ctx.fill();

  // Vẽ từng phần
  segments.forEach((label, i) => {
    ctx.beginPath();
    const color = label === 'JACKPOT' ? '#bf1f1f' : colors[i % colors.length];
    const innerRadius = 0;
    const outerRadius = radius - 20;
    const gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius);
    const rgbaBase = hexToRGBA(color);
    gradient.addColorStop(0, `${rgbaBase(0.5)}`);
    gradient.addColorStop(1, `${rgbaBase(1.0)}`);
    ctx.fillStyle = gradient;
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, outerRadius, arc * i, arc * (i + 1));
    ctx.lineTo(0, 0);
    ctx.fill();

    // Viền trắng mỗi phần
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Text
    ctx.rotate(arc * i + arc / 2);
    ctx.translate(label === 'JACKPOT' ? radius - 70 : radius - 80, 0);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = label === 'JACKPOT' ? 'yellow' : "#fff";
    ctx.font = getFontSize(label.toString());
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeText(label, 0, 0);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });

  ctx.restore();

  // LED viền
  const ledCount = 30;
  const ledRadius = 4;
  const ledAngle = (2 * Math.PI) / ledCount;
  for (let i = 0; i < ledCount; i++) {
    const r = radius - 10;
    const x = radius + r * Math.cos(ledAngle * i);
    const y = radius + r * Math.sin(ledAngle * i);
    ctx.beginPath();
    ctx.arc(x, y, ledRadius, 0, 2 * Math.PI);
    ctx.fillStyle = i % 2 === lightIndex % 2 ? "#f55555" : "#ffffff";
    ctx.fill();
  }

  // Viền ngoài cùng trắng
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
}, [angle, lightIndex, segments]);


  useEffect(() => {
    const interval = setInterval(() => {
      setLightIndex((prev) => (prev + 1) % 2);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(()=>{
    generateOutcomes();
    if (user && typeof user.userPoints === "number") {
      setScore(user.userPoints);
      setPrevScore(user.userPoints);
    }
  }, []);

  return (
    <div className={classes.luckyWheel}>
      <h1>Lucky Wheel</h1>
      <div className={classNames(classes.wheelBox, {[classes.shake]: isSpinning})}>
        <div className={classes.wheel}>
          <canvas ref={canvasRef} />
          <div className={classes.triangle}></div>
          <div className={classes.jackpotInfo}>
            <h3>Jackpot</h3>
            <div>
              {jackpot} <img src={star} height={30} />
            </div>
          </div>
        </div>

        <div className={classes.actions}>
          <Tippy content="Generate new random values">
            <button className={customMode ? 'btn sub' : 'btn main2'} onClick={generateOutcomes}>Random Wheel</button>
          </Tippy>
          <Tippy content="Customize your own wheel values (-50 pts)">
            <button className={customMode ? 'btn main2' : 'btn sub'} onClick={() => setCustomMode(true)}>Custom Wheel</button>
          </Tippy>
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning || score < 10}
          className={`btn ${classes.spinBtn}`}
        >
          {isSpinning ? "Spinning..." : "SPIN NOW"}
          <span className="price">-10 <img src={star} alt="stars" width={20} /></span>
        </button>

        <div className={classes.relative}>
          <YourPoints prevScore={prevScore} score={score} />
          {result && !isSpinning && <FlyPoint point={result} />}
        </div>

        {customMode && (
          <Modal setShowModal={setCustomMode} width={600}>
            <div className={classes.customBox}>
              <h4>Customize Wheel Segments (Max {MAX_CHAR} chars)</h4>
              {customSegments.map((val, idx) => (
                <input
                  key={idx}
                  maxLength={MAX_CHAR}
                  value={val}
                  onChange={(e) => {
                    const newArr = [...customSegments];
                    newArr[idx] = e.target.value;
                    setCustomSegments(newArr);
                  }}
                />
              ))}
              <div className="buttons" style={{textAlign: 'right'}}>
              <button className="btn" onClick={applyCustomSegments} disabled={!customSegments.every(text => text !== '')}>
                Apply
                <span className="price">-50 <img src={star} alt="stars" width={20} /></span>
              </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default LuckyWheel;
