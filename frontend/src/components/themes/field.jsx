import styles from './styles.module.scss';

const Field = () => {
    // Generate dense rice field
      const riceRows = 8;
      const riceCols = 40;
      const riceElements = [];
      for (let row = 0; row < riceRows; row++) {
        for (let col = 0; col < riceCols; col++) {
          riceElements.push(
            <img
              key={`r${row}c${col}`}
              src="/svg/rice.svg"
              className={styles.rice}
              alt="rice"
              style={{
                left: `${col * 2.5}%`,
                bottom: `${row * 10}px`,
                zIndex: riceRows - row, // lower rows appear on top
              }}
            />
          );
        }
      }
    return (
       <div className={`${styles.riceTheme} ${styles.active}`}>{riceElements}</div>
    )
}

export default Field;