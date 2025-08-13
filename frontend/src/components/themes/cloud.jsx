import styles from './styles.module.scss';
import { memo } from 'react';

const Cloud = memo(() => {
    const cloudCount = Math.floor(Math.random() * 4) + 2; // 2–5 clouds
      const cloudElements = Array.from({ length: cloudCount }).map((_, i) => {
      const size = 150 + Math.random() * 100; // 150–250px
      const top = (i * 100) / cloudCount + Math.random() * 10 - 5; // phân bố đều, thêm dao động
      const delay = Math.random() * 5; // ngắn hơn để không chờ lâu
      const left = -size - Math.random() * 300;
      const duration = 25 + Math.random() * 20; // mỗi mây bay với tốc độ khác nhau
    
      return (
        <img
          key={i}
          src={`/svg/cloud${i % 2 === 0 ? 1 : 2}.svg`}
          className={styles.cloud}
          alt="cloud"
          style={{
            width: `${size}px`,
            top: `${top}%`,
            left: `${left}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      );
    });
    
    return (
        <div className={`${styles.skyTheme} ${styles.active}`}>{cloudElements}</div>
    )
})

export default Cloud;