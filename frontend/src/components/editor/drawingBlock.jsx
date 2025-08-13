import React, { useRef, useState, useEffect } from 'react';
import styles from './styles.module.scss';

const DrawingBlock = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000');
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });

  // Resize canvas theo màn hình
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = 500;
      const width = Math.min(window.innerWidth - 32, maxWidth);
      const height = Math.round((width / 5) * 3); // tỷ lệ 5:3
      setCanvasSize({ width, height });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
  }, [color, canvasSize]);

  // Handle touch events thủ công
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getTouchOffset = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const { x, y } = getTouchOffset(e);
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;
      setIsDrawing(true);
    };

    const handleTouchMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getTouchOffset(e);
      const ctx = canvas.getContext('2d');
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      setIsDrawing(false);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDrawing, color]);

  const getMouseOffset = (e) => ({
    x: e.nativeEvent.offsetX,
    y: e.nativeEvent.offsetY,
  });

  const startDrawing = (e) => {
    const { x, y } = getMouseOffset(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    setIsDrawing(true);
  };

  const drawWithMouse = (e) => {
    if (!isDrawing) return;
    const { x, y } = getMouseOffset(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const dataUrl = canvasRef.current.toDataURL();
    onSave(dataUrl);
  };

  return (
    <div style={{ userSelect: 'none' }} className={styles.drawingBoard}>
      <div>
        <label>Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </div>
      <div>
        <label>Board</label>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            border: '1px solid black',
            cursor: 'crosshair',
            touchAction: 'none',
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
          }}
          onMouseDown={startDrawing}
          onMouseMove={drawWithMouse}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div style={{textAlign: 'center'}}>
        <button className="btn" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default DrawingBlock;
