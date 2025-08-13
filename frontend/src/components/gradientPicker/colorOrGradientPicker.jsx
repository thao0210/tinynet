import GradientPicker from "./index";
import React, { useState, useEffect, useRef } from "react";
import styles from "./colorOrGradient.module.scss";

const ColorOrGradientPicker = ({ label, value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const isGradient = typeof value === "string" && value.startsWith("linear-gradient");
  const [colorValue, setColorValue] = useState(!isGradient ? value || "#000000" : "#000000");
  const [gradientValue, setGradientValue] = useState(isGradient ? value : "");
  const [boxValue, setBoxValue] = useState(value || '#000000');
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorChange = (e) => {
    const val = e.target.value;
    setColorValue(val);
    onChange(val);
    setBoxValue(val);
  };

  const handleGradientChange = (val) => {
    setGradientValue(val);
    onChange(val);
    setBoxValue(val);
  };

  return (
    <div className={styles.wrapper} ref={pickerRef}>
      {label && <label className={styles.label}>{label}</label>}

      <div
        className={styles.previewBox}
        style={{ background: boxValue }}
        onClick={() => setShowPicker(!showPicker)}
      />

      {showPicker && (
        <div className={styles.pickerPopup}>
          <div className={styles.pickerSection}>
            <div className={styles.pickerLabel}>Color</div>
            <input
              type="color"
              value={colorValue}
              onChange={handleColorChange}
              className={styles.colorInput}
            />
          </div>

          <div className={styles.pickerSection}>
            <div className={styles.pickerLabel}>Gradient</div>
            <GradientPicker
              initialValue={gradientValue}
              onChange={handleGradientChange}
              autoUpdate
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorOrGradientPicker;