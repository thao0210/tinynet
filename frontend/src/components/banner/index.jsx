import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {StarPoints} from '@/components/Utilities';
import classes from './styles.module.scss';

const baseUrl = import.meta.env.VITE_R2_BASE_URL;
const CongratsBanner = ({ visible, onClose, time = 3, points, content }) => {
  const [exit, setExit] = useState(false);
  const canvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);

  useEffect(() => {
    if (visible) {

      // Tạo canvas riêng
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '99999'; // đảm bảo trên modal
      document.body.appendChild(canvas);
      canvasRef.current = canvas;

      // Tạo confetti instance gắn với canvas này
      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      });
      confettiInstanceRef.current = myConfetti;

      // Fireworks effect
      const duration = time * 1000;
      const end = Date.now() + duration;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
        }

        myConfetti({
          particleCount: 100,
          spread: 90,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2
          }
        });
      }, 300);

      const timeout = setTimeout(() => {
        setExit(true);
        // Delay để animation chạy xong
        setTimeout(() => {
          onClose?.();
          setExit(false);
        }, 800);
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        if (canvas) {
          document.body.removeChild(canvas);
        }
      };
    }
  }, [visible, time, onClose]);

  if (!visible && !exit) return null;

  return (
    <div className={classes.overlay}>
      <div className={classes.starBanner} style={{animation: exit ? "flyOut 0.8s forwards" : "popUp 0.5s ease-out", 
      backgroundImage: `url(${baseUrl}/girl6.webp)`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right bottom",
      backgroundColor: "#000000",
      backgroundSize: "200px 300px"
      }}>
        <h2>CONGRATULATIONS!</h2>
        {
          content
        }
        You received <strong><StarPoints points={points} size={35} /></strong>!
      </div>
    </div>
  );
};

export const BannerIntro = () => {
  return (
      <div className={classes.content}>
          <h2>Welcome to the creative garden!</h2>
          <div className={classes.flex}>
              <div>
                  <div className={classes.image}>
                      <img src={`${baseUrl}/girl1.webp`} height={120} />
                  </div>
                  <div>
                    <h4>Writing, drawing or card?</h4>
                    <p>Bring your dream world to life with art.</p>
                  </div>
              </div>
              <div>
                  <div className={classes.image}>
                      <img src={`${baseUrl}/girl4.webp`} height={120} />
                  </div>
                  <div>
                    <h4>Lazy to type?</h4>
                    <p>Just speak — we’ll type it for you.</p>
                  </div>
              </div>
              <div>
                  <div className={classes.image}>
                      <img src={`${baseUrl}/girl3.webp`} height={120} />
                  </div>
                  <div>
                    <h4>Love Stories?</h4>
                    <p>Listen with text-to-speech anytime</p>
                  </div>
              </div>
              <div>
                  <div className={classes.image}>
                      <img src={`${baseUrl}/girl2.webp`} height={120} />
                  </div>
                  <div>
                    <h4>Security content?</h4>
                    <p>Protect it with password & OTP access.</p>
                  </div>
              </div>
          </div>
      </div>
  )
}

export const BannerIntro2 = () => {
  return (
      <div className={classes.content}>
          <div>
              <h1>BE THE FIRST!</h1>
              <ul>
                  <li>
                      
                      <img src='/star.webp' height={50} />
                      <strong>First 10 users</strong>
                      <StarPoints points={'+10,000'} size={30} />
                  </li>
                  <li>
                      <img src='/star.webp' height={50} />
                      <strong>Next 90 users</strong>
                      <StarPoints points={'+3,000'} size={30} />
                  </li>
                  <li>
                      <img src='/star.webp' height={50} />
                      <strong>All other new users</strong>
                      <StarPoints points={'+500'} size={30} /> 
                  </li>
              </ul>
              <button className="btn">Sign in now</button>
          </div> 
          <img src={`${baseUrl}/girl.webp`} />   
      </div>
  )
}

export default CongratsBanner;
