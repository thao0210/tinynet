import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const transitionPresets = {
  none: {
    initial: {},
    animate: {},
    transition: { duration: 0 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 1 }
  },
  zoom: {
    initial: { opacity: 0, scale: 1.5 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 1 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 150 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 1 }
  },
  slideRight: {
    initial: { opacity: 0, x: -150 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 1 }
  },
  slideDown: {
    initial: { opacity: 0, y: -400 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideUp: {
    initial: { opacity: 0, y: 400 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(20px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    transition: { duration: 1.2 }
  },
  flip: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
    transition: { duration: 0.8 }
  },
  bounce: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'spring', stiffness: 100, damping: 10 }
  }
};

export const TypingEffect = ({ text, delay = 0, isPause }) => {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}>
      {words.map((word, wIndex) => (
        <span key={wIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: 4 }}>
          {[...word].map((char, i) => (
            <motion.span
              key={`${wIndex}-${i}`}
              initial={{ opacity: 0 }}
              animate={isPause ? false : { opacity: 1 }}
              transition={{ delay: delay + (wIndex * 5 + i) * 0.08 }}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

export const ZoomLetters = ({ text, delay = 0, isPause }) => {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}>
      {words.map((word, wIndex) => (
        <span key={wIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: 4 }}>
          {[...word].map((char, i) => (
            <motion.span
              key={`${wIndex}-${i}`}
              initial={{ scale: 0.7 }}
              animate={isPause ? false : { scale: [0.7, 1, 2, 1] }}
              transition={{
                duration: 0.6,
                delay: delay + (wIndex * 5 + i) * 0.08,
                ease: 'easeInOut',
              }}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

export const DancingLetters = ({ text, delay = 0, isPause }) => {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}>
      {words.map((word, wIndex) => (
        <span key={wIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: 4 }}>
          {[...word].map((char, i) => (
            <motion.span
              key={`${wIndex}-${i}`}
              animate={isPause ? false : { rotate: [0, 10, 0, -10, 0], y: [0, 3, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: delay + (wIndex * 5 + i) * 0.1
              }}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

export const BounceLetters = ({ text, delay = 0, isPause }) => {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}>
      {words.map((word, wIndex) => (
        <span key={wIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: 4 }}>
          {[...word].map((char, i) => (
            <motion.span
              key={`${wIndex}-${i}`}
              animate={isPause ? false : { y: [0, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: delay + (wIndex * 5 + i) * 0.1
              }}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

export const WaveLetters = ({ text, delay = 0, isPause }) => {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}>
      {words.map((word, wIndex) => (
        <span key={wIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: 4 }}>
          {[...word].map((char, i) => (
            <motion.span
              key={`${wIndex}-${i}`}
              animate={isPause ? false : { y: [0, -5, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: delay + (wIndex * 5 + i) * 0.1
              }}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};


export const ShockText = ({ text, delay = 0, isPause }) => {
  const words = text.split(' ');
  return (
    <div style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}>
      {words.map((word, wIndex) => (
        <motion.span
          key={wIndex}
          initial={{ scale: 0.5, y: -100, opacity: 0 }}
          animate={isPause ? false : { scale: [5, 0.8, 1], y: [0, -10, 0], opacity: 1 }}
          transition={{
            delay: delay + wIndex * 0.3,
            duration: 0.6,
            ease: 'easeOut',
            type: 'tween'
          }}
          style={{
            display: 'inline-block',
            marginRight: 6
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export const ExplodeText = ({ text, delay = 0, isPause }) => {
  const [explode, setExplode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExplode(true), delay * 1000 + 1000); // explode sau 1s
    return () => clearTimeout(timer);
  }, [delay]);

  const words = text.split(' ');

  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre-wrap', position: 'relative' }}>
      {words.map((word, wIndex) => (
        <span
          key={wIndex}
          style={{
            whiteSpace: 'nowrap',
            display: 'inline-block',
            marginRight: 6,
            position: 'relative',
          }}
        >
          {[...word].map((char, i) => {
            const x = (Math.random() - 0.5) * 300;
            const y = (Math.random() - 0.5) * 200;
            const rotate = (Math.random() - 0.5) * 360;

            return (
              <motion.span
                key={`${wIndex}-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={isPause ? false : explode ? { x, y, opacity: 0, rotate } : {}}
                transition={{
                  delay: delay + (wIndex * 5 + i) * 0.03,
                  duration: 0.6,
                  ease: 'easeOut'
                }}
                style={{ display: 'inline-block', position: 'relative' }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
};

export const SpiderDropText = ({ text, delay = 0, isPause }) => {
  const words = text.split(' ');

  return (
    <div style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}>
      {words.map((word, wIndex) => (
        <span
          key={wIndex}
          style={{
            whiteSpace: 'nowrap',
            display: 'inline-block',
            marginRight: 6,
            position: 'relative'
          }}
        >
          {[...word].map((char, i) => (
            <motion.span
              key={`${wIndex}-${i}`}
              initial={{ y: -100, opacity: 0, rotate: 0 }}
              animate={isPause ? false : { y: 0, opacity: 1, rotate: [0, 10, -10, 5, -5, 0] }}
              transition={{
                delay: delay + (wIndex * 5 + i) * 0.08,
                duration: 1,
                ease: 'easeOut'
              }}
              style={{
                display: 'inline-block',
                position: 'relative',
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
};