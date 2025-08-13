import React, { useEffect, useRef, memo } from 'react';
import styles from './styles.module.scss';
import Cloud from './cloud';
import River from './river';
import Field from './field';
import Music from './music';
import { BalloonTheme } from './balloon';
import { shapeIcons } from './shapeIcons';

const getRandomColor = (_colors) => {
  const colors = _colors ? _colors : ['#913ccd', '#f06075', '#f76e3c','#f7d842', '#2ca8c2', '#98cb49', '#849098', '#5481e6'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Shape = ({ shape, style, group }) => {
  // 🧠 Nếu shape là một React component function (vì đã là icon được chọn sẵn), render trực tiếp
  if (typeof shape === 'function') {
    const Comp = shape;
    return (
      <div className={styles.absolute} style={{ ...style, color: style.backgroundColor }}>
        <Comp width="100%" height="100%" />
      </div>
    );
  }

  // 🧠 Nếu shape là string và thuộc nhóm basic/cards → tra trong shapeIcons
  if ((group === 'basic' || group === 'cards') && typeof shape === 'string') {
    const Comp = shapeIcons[group]?.[shape];
    if (typeof Comp === 'function') {
      return (
        <div className={styles.absolute} style={{ ...style, color: style.color }}>
          <Comp width="100%" height="100%" />
        </div>
      );
    } else {
      console.warn(`⚠️ Không tìm thấy shape "${shape}" trong group "${group}"`);
    }
  }

  // Default: hình ảnh từ public
  return (
    <img
      src={shape}
      alt="shape"
      className={styles.absolute}
      style={{
        ...style,
        objectFit: 'contain',
        backgroundColor: 'transparent',
      }}
    />
  );
};

export const RandomShapesBackground = memo(({ themeShape }) => {
  const {
    background = '#ffffff',
    count = 10,
    group = 'basic',
    name = 'mix',
    shapeColor,
    opacity = 0.9,
    rotate,
  } = themeShape;

  const minSize = 50;
  const maxSize = 300;
  const bias = 5;

  let shapeKeys = [];

  if (group === 'basic' || group === 'cards') {
  const iconMap = shapeIcons[group] || {};
    shapeKeys =
      name === 'mix'
        ? Object.keys(iconMap)
        : iconMap[name] ? [name] : [];
  } else if (group === 'animals' || group === 'emoji') {
    if (name === 'mix') {
      shapeKeys = Array.from({ length: 4 }, (_, i) => `/shapes/${group}/${i + 1}.svg`);
    } else {
      shapeKeys = [`/shapes/${group}/${name}.svg`]; // name là số: 1,2,3,...
    }
  } else if (group === 'custom' && name) {
    shapeKeys = [name]; // custom là full url
  }

  if (!shapeKeys.length) {
    console.warn('⚠️ Không có shape nào được chọn, fallback về square');
    shapeKeys = ['square'];
  }

  const shapes = Array.from({ length: count }, (_, i) => {
    const shape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    const randomFactor = Math.pow(Math.random(), bias);
    const size = Math.floor(minSize + (maxSize - minSize) * randomFactor);
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const color =
      (group === 'cards' || group === 'basic') && !shapeColor
        ? getRandomColor()
        : typeof shapeColor === 'object' ? getRandomColor(shapeColor) : shapeColor;
    const opa = opacity ?? 0.1 + Math.random() * 0.1;
    const rotation = rotate || `${Math.floor(Math.random() * 360)}deg`;

    return (
      <Shape
        key={`shape-${i}-${shape}`}
        shape={shape}
        group={group}
        style={{
          width: size,
          height: size,
          color: color,
          top: `${top}%`,
          left: `${left}%`,
          opacity: opa,
          transform: `rotate(${rotation})`,
        }}
      />
    );
  });

  return <div className={styles.wrapper} style={{ background }}>{shapes}</div>;
});

export const AnimatedBackground = ({ type = "cloud" }) => {
  const themes = {
    cloud: <Cloud />,
    river: <River />,
    field: <Field />,
    music: <Music />,
    balloon: <BalloonTheme />,
  };

  return (
    <div className={styles.container}>
      {themes[type]}
    </div>
  );
}
const RainEffect = ({
  count = 100,
  minLength = 10,
  maxLength = 30,
  speed = 2,
  background = 'transparent',
  rainColor = '#99999990',
  angle = -15
}) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const radian = (angle * Math.PI) / 180;
      const slope = Math.tan(radian);
      const extraWidth = Math.abs(slope * height);

      canvas.width = width + extraWidth;
      canvas.height = height;

      canvas.dataset.offset = slope > 0 ? -extraWidth : 0;
      canvas.style.left = `${slope > 0 ? -extraWidth : 0}px`;

      return { width, height, slope, extraWidth };
    };

    let { width, height, slope, extraWidth } = resizeCanvas();

    let raindrops = Array.from({ length: count }).map(() => ({
      x: Math.random() * (width + extraWidth),
      y: Math.random() * height,
      length: Math.random() * (maxLength - minLength) + minLength,
      speed: Math.random() * speed + 2
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = rainColor;
      ctx.lineWidth = 1;

      for (let drop of raindrops) {
        const offsetX = drop.length * slope;

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + offsetX, drop.y + drop.length);
        ctx.stroke();

        drop.x += offsetX * (drop.speed / drop.length);
        drop.y += drop.speed;

        if (drop.y > height || drop.x < 0 || drop.x > canvas.width) {
          drop.y = -drop.length;
          drop.x = Math.random() * (width + extraWidth);
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      const result = resizeCanvas();
      width = result.width;
      height = result.height;
      slope = result.slope;
      extraWidth = result.extraWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count, minLength, maxLength, speed, rainColor, angle]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 0,
        background,
        pointerEvents: 'none',
      }}
    />
  );
};


export default RainEffect;
