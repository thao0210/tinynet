import { memo } from 'react';
import styles from './styles.module.scss';

const River = memo(() => {
    // Generate multiple fish
      const fishSources = [1, 2, 3, 4, 5];
      const fishCount = 10;
      const fishElements = Array.from({ length: fishCount }).map((_, i) => {
        const isReverse = i % 2 === 1;
        const fishClass = isReverse ? styles.fishReverse : styles.fish;
        const top = 10 + Math.random() * 60;
        const delay = Math.random() * 10;
        const isMobile = window.innerWidth < 768;
        const duration = isMobile
            ? 6 + Math.random() * 15 // mobile: 10-20s
            : 20 + Math.random() * 30;
        const fishType = fishSources[Math.floor(Math.random() * fishSources.length)];
        return (
          <img
            key={i}
            src={`/svg/fish${fishType}.svg`}
            className={fishClass}
            alt="fish"
            style={{
              top: `${top}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      });

    // Generate bubbles
      const bubbleCount = 20;
      const bubbleElements = Array.from({ length: bubbleCount }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const size = 4 + Math.random() * 12;
        return (
          <div
            key={i}
            className={styles.bubble}
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
            }}
          ></div>
        );
      });
    return (
       <div className={`${styles.waterTheme} ${styles.active}`}>
            <div className={styles.waterFlow}></div>
            {fishElements}
            {bubbleElements}
        </div>
    )
})

export default River;