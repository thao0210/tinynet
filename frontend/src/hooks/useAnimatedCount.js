import { useEffect, useState } from "react";

export const useAnimatedCount = (fromValue, toValue, duration = 1000) => {
    const [count, setCount] = useState(fromValue);
  
    useEffect(() => {
      let animationFrameId;
      const startTime = performance.now();
  
      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newVal = Math.floor(fromValue + (toValue - fromValue) * progress);
        setCount(newVal);
  
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };
  
      // Nếu fromValue === toValue thì set luôn
      if (fromValue === toValue) {
        setCount(toValue);
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
  
      // Clean up khi unmount hoặc rerun
      return () => cancelAnimationFrame(animationFrameId);
    }, [fromValue, toValue, duration]);
  
    return count;
  };