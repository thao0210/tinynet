import { useState, useRef } from "react";
import classes from './styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';

const OtpInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Chỉ cho phép nhập số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every((num) => num !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className={classes.otpBox}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </div>
  );
};

const VerifyOtp = ({ email, onSuccess, itemId }) => {  
    const handleVerifyOtp = async (otp) => {
      const res = await api.post(itemId ? `${urls.LIST}/${itemId}/verify-otp` : urls.VERIFY_OTP, {email, otp})
      if (res.data) {
        res.data.tempToken ?  onSuccess(res.data.tempToken) : onSuccess();
    };
    }
  
    return (
      <div>
        <OtpInput length={6} onComplete={handleVerifyOtp} />
      </div>
    );
  };

export default VerifyOtp;
