import styles from './styles.module.scss';
import { memo } from 'react';

const Music = memo(() => {
    // Music theme: 4 wave lines + floating notes
      const musicLines = Array.from({ length: 4 }).map((_, i) => (
        <svg
          key={i}
          className={styles.musicLine}
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
          style={{ bottom: `${10 + i * 8}px` }}
        >
          <path
            d="M0 1 Q 25 0 50 1 Q 75 2 100 1"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1.2"
            fill="transparent"
          />
        </svg>
      ));
    
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const noteCount = isMobile ? 5 : 12;
    
      const noteTypes = [1, 2, 3, 4];
      const noteElements = Array.from({ length: noteCount }).map((_, i) => {
      const size = 20 + Math.random() * 12;
      const baseLeft = (i * 100) / noteCount;
      const left = baseLeft + (Math.random() * 8 - 4); // tránh trùng
      const bottom = 5 + Math.random() * 20;
      const delay = Math.random() * 3;
      const duration = 6 + Math.random() * 4;
      const noteType = noteTypes[Math.floor(Math.random() * noteTypes.length)];
    
      return (
        <img
          key={i}
          src={`/svg/note${noteType}.svg`}
          className={styles.musicNote}
          alt="note"
          style={{
            width: `${size}px`,
            left: `${Math.min(95, Math.max(0, left))}%`, // tránh ra khỏi khung
            bottom: `${bottom}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      );
    });
    return (
       <div className={`${styles.musicTheme} ${styles.active}`}>
            {musicLines}
            {noteElements}
        </div>
    )
})

export default Music;