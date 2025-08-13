import styles from "./styles.module.scss";
import { memo } from 'react';

export const BalloonTheme = memo(() => {
  const balloonTypes = [1, 2, 3];
  const balloonCount = 12;

  const balloonElements = Array.from({ length: balloonCount }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = 10 + Math.random() * 10;
    const size = 40 + Math.random() * 30;
    const balloonType = balloonTypes[Math.floor(Math.random() * balloonTypes.length)];

    return (
      <img
        key={i}
        src={`/svg/balloon${balloonType}.svg`} // bạn tự cung cấp SVG
        className={styles.balloon}
        alt="balloon"
        style={{
          left: `${left}%`,
          width: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  return <div className={styles.balloonTheme}>{balloonElements}</div>;
});
