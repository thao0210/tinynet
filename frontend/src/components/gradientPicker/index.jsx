import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { RiDeleteBin5Fill } from "react-icons/ri";
import Tippy from '@tippyjs/react';
import Dropdown from "../dropdown";

const parseGradient = (value) => {
    const linearMatch = value.match(/^linear-gradient\((\d+)deg,\s*(.+)\)$/);
    const radialMatch = value.match(/^radial-gradient\(circle,\s*(.+)\)$/);
  
    if (linearMatch) {
      const angle = parseInt(linearMatch[1], 10);
      const stops = linearMatch[2].split(',').map((s) => {
        const [color, pos] = s.trim().split(/\s+/);
        return { color, position: parseFloat(pos) };
      });
      return { type: 'Linear', angle, stops };
    }
  
    if (radialMatch) {
      const stops = radialMatch[1].split(',').map((s) => {
        const [color, pos] = s.trim().split(/\s+/);
        return { color, position: parseFloat(pos) };
      });
      return { type: 'Radial', angle: 0, stops };
    }
  
    return null;
  };
  
  const GradientPicker = ({ onChange, initialValue, autoUpdate = false }) => {
  const [type, setType] = useState('Linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState([
    { color: '#FF0000', position: 0 },
    { color: '#0000FF', position: 100 },
  ]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const initialized = useRef(false);
  const barRef = useRef(null);
  const panelRef = useRef(null);
  const [shiftLeft, setShiftLeft] = useState(false);

  useLayoutEffect(() => {
    if (!panelRef.current || !barRef.current) return;

    const panelRect = panelRef.current.getBoundingClientRect();
    const barRect = barRef.current.getBoundingClientRect();
    const isOverflowingRight = panelRect.right > barRect.right;

    setShiftLeft(isOverflowingRight);
  }, [selectedIndex, stops]);

  useEffect(() => {
    if (!initialized.current && initialValue) {
      const parsed = parseGradient(initialValue);
      if (parsed) {
        setType(parsed.type);
        setAngle(parsed.angle);
        setStops(parsed.stops);
      }
      initialized.current = true;
    }
  }, [initialValue]);

  const updateStop = (index, key, value) => {
    const newStops = [...stops];
    newStops[index][key] = value;
    setStops(sortStops(newStops));
  };

  const sortStops = (arr) => [...arr].sort((a, b) => a.position - b.position);

  const handleAddStop = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    const newStops = sortStops([...stops, { color: '#FFFFFF', position }]);
    setStops(newStops);
    setSelectedIndex(newStops.findIndex((s) => s.position === position));
  };

  const handleDrag = (e, index) => {
    const bar = document.getElementById('gradient-bar');
    const rect = bar.getBoundingClientRect();
    const move = (eMove) => {
      let pos = ((eMove.clientX - rect.left) / rect.width) * 100;
      pos = Math.max(0, Math.min(100, pos));
      updateStop(index, 'position', pos);
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  const handleRemove = (index) => {
    if (stops.length <= 2) return;
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
    setSelectedIndex(null);
  };

  const gradient =
    type === 'Linear'
      ? `linear-gradient(${angle}deg, ${stops
          .map((s) => `${s.color} ${Math.round(s.position)}%`)
          .join(', ')})`
      : `radial-gradient(circle, ${stops
          .map((s) => `${s.color} ${Math.round(s.position)}%`)
          .join(', ')})`;

  useEffect(() => {
    if (autoUpdate && onChange) onChange(gradient);
  }, [gradient, autoUpdate]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div id='gradient-id'>
          <label>Type</label>
          <Dropdown
            curValue={type}
            list={['Linear', 'Radial']}
            onSelect={(value) => setType(value)}
            width={100}
            dropdownContainerSelector='#gradient-id'
            stopPropagation
          />
        </div>
        
        {type === 'Linear' && (
          <div>
            <label>Angle</label>
            <span>
              <input
                type="number"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className={styles.angleInput}
              />
              deg
            </span>
          </div>
        )}
      </div>

      <div
        id="gradient-bar"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleAddStop(e);
        }}
        className={styles.gradientBar}
        style={{ background: gradient }}
        ref={barRef}
      >
        {stops.map((s, i) => (
          <div
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(i);
            }}
            onMouseDown={(e) => handleDrag(e, i)}
            className={`${styles.stopDot} ${selectedIndex === i ? styles.selectedDot : ''}`}
            style={{ left: `${s.position}%`, background: s.color }}
          />
        ))}

        {selectedIndex !== null && (
          <div
            className={classNames(styles.colorPanel, { [styles.shiftLeft]: shiftLeft })}
            style={{ left: `${stops[selectedIndex].position - 10}%` }}
            onClick={(e) => e.stopPropagation()}
            ref={panelRef}
          >
            <div className={styles.arrow} />
            <Tippy content="Change color">
              <input
                type="color"
                value={stops[selectedIndex].color}
                onChange={(e) => updateStop(selectedIndex, 'color', e.target.value)}
              />
            </Tippy>
            <Tippy content="Delete this stop">
              <span>
                <RiDeleteBin5Fill size={22} onClick={() => handleRemove(selectedIndex)} />
              </span>
            </Tippy>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradientPicker;
