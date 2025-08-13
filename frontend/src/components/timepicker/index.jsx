// components/DateTimePicker.jsx
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import classes from './styles.module.scss';

/**
 * @param {Object} props
 * @param {Date|null} props.value - ngày đang chọn
 * @param {Function} props.onChange - callback khi đổi giá trị
 * @param {boolean} props.includeTime - có chọn giờ không?
 * @param {string} props.label - nhãn hiển thị
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
  const handleChange = (newDate) => {
    if (field && typeof onChange === "function") {
      onChange((prev) => ({
        ...prev,
        [field]: newDate,
      }));
    } else {
      onChange(newDate);
    }
  };
  return (
    <div className={classes.datePicker}>
      {label && <label>{label}</label>}
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={handleChange}
        showTimeSelect={includeTime}
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat={includeTime ? "Pp" : "dd/MM/yyyy"}
        placeholderText={includeTime ? "Date and time" : "Choose the date"}
        className="border px-3 py-2 rounded"
        minDate={isFuture ? now : null}
        // minTime={includeTime && isFuture ? now : null}
      />
    </div>
  );
}
