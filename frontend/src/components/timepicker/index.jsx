// components/DateTimePicker.jsx
import React, { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_orange.css";
import classes from "./styles.module.scss";
/**
 * @param {Object} props
 * @param {Date|string|null} props.value - ngày đang chọn
 * @param {Function} props.onChange - callback khi đổi giá trị
 * @param {boolean} props.includeTime - có chọn giờ không?
 * @param {string} props.label - nhãn hiển thị
 * @param {boolean} props.isFuture - chỉ cho phép chọn ngày giờ tương lai
 * @param {string|null} props.field - tên field (nếu muốn trả về object)
 */
export default function DateTimePicker({
  value,
  onChange,
  includeTime = false,
  label = "Select date",
  isFuture = false,
  field = null
}) {
  const now = new Date();
  const [internalValue, setInternalValue] = useState(value ? new Date(value) : '');
  const handleChange = (selectedDates) => {
    const newDate = selectedDates[0] || null;
    if (field && typeof onChange === "function") {
      onChange((prev) => ({
        ...prev,
        [field]: newDate,
      }));
    } else {
      onChange(newDate);
    }
  };

  useEffect(() => {
    setInternalValue(value ? new Date(value) : '');
  }, [value]);

  return (
    <div className={classes.datePicker}>
      {label && <label>{label}</label>}
      <Flatpickr
        value={internalValue}
        onChange={handleChange}
        options={{
          enableTime: includeTime,
          dateFormat: includeTime ? "d/m/Y H:i" : "d/m/Y",
          time_24hr: true,
          minuteIncrement: 15,
          minDate: isFuture ? now : null,
        }}
        className="border px-3 py-2 rounded"
        placeholder={includeTime ? "Date and time" : "Choose the date"}
      />
    </div>
  );
}
