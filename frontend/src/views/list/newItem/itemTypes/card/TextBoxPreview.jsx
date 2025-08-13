import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BounceLetters, DancingLetters, ExplodeText, ShockText, SpiderDropText, TypingEffect, WaveLetters, ZoomLetters } from './effect';
import SpeechBubble from '@/components/speechBubble';
import { generateCartoonShadow, generateRainboxShadow } from "@/utils/color";

const TextBoxPreview = ({ box, delay = 0, loopKey, isPause }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, loopKey]);

  if (!visible) return null;

  const style = {
    position: 'absolute',
    left: box.offsetX + window.innerWidth / 2,
    top: box.offsetY + window.innerHeight / 2 + 20,
    width: box.width,
    height: box.height,
    fontSize: box.fontSize,
    fontFamily: box.fontFamily,
    textAlign: box.textAlign,
    color: box.color,
    padding: '0px 10px',
    textShadow: box.textShadow === 'rainbow' ? generateRainboxShadow(box.fontSize) :
                box.textShadow === 'cartoon' ? generateCartoonShadow(box.fontSize) : 
                box.textShadow || 'none',
    lineHeight: 1.1,
    background: box.background,
    // overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const renderLine = (lineText, index, lineDelay) => {
    switch (box.effect) {
      case 'typing': return <TypingEffect key={index} text={lineText} delay={lineDelay} isPause={isPause} />;
      case 'zoom': return <ZoomLetters key={index} text={lineText} delay={lineDelay} isPause={isPause} />;
      case 'dancing': return <DancingLetters key={index} text={lineText} delay={lineDelay} isPause={isPause} />;
      case 'bounce': return <BounceLetters key={index} text={lineText} delay={lineDelay} isPause={isPause} />;
      case 'wave': return <WaveLetters key={index} text={lineText} delay={lineDelay} isPause={isPause} />;
      case 'shock': return <ShockText key={index} text={lineText} delay={lineDelay} isPause={isPause} />;
      case 'explode': return <ExplodeText key={index} text={lineText} delay={lineDelay} isPause={isPause} />;
      case 'spider': return <SpiderDropText key={index} text={lineText} delay={lineDelay} isPause={isPause} />;
      default: return <div key={index}>{lineText}</div>;
    }
  };

  const lines = box.text.split('\n').filter(line => line.trim() !== '');
  const charDelay = 0.08; // thời gian mỗi ký tự (giây)
  const pauseBetweenLines = 0.5; // nghỉ giữa các dòng (giây)

  const lineDelays = lines.map((line, i) => {
    const prevChars = lines.slice(0, i).reduce((sum, l) => sum + l.length, 0);
    return prevChars * charDelay + i * pauseBetweenLines;
  });

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {lines.map((line, idx) => renderLine(line, idx, lineDelays[idx]))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isPause ? false : { opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={style}
    >
      {box?.frame?.shape ? (
        <SpeechBubble
          type={box.frame.type}
          shape={box.frame.shape}
          fill={box.frame.fill || '#DDD'}
          strokeColor={box.frame.strokeColor}
          direction={box.frame.direction}
          opacity={box.frame.opacity}
        >
          {content}
        </SpeechBubble>
      ) : content}
    </motion.div>
  );
};

export default TextBoxPreview;
