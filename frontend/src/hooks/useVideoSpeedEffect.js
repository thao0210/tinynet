import { useCallback } from 'react';

export function useVideoSpeedEffect(effectType, screenDuration) {
  const getSpeedAt = useCallback((currentTime) => {
    const t = currentTime / screenDuration;

    switch (effectType) {
      case 'effect:accelerate':
        // tăng dần từ 1x đến 3x
        return 1 + 2 * t;

      case 'effect:decelerate':
        // giảm dần từ 3x về 1x
        return 3 - 2 * t;

      case 'effect:slowFastSlow':
        // y = sin(pi * t)
        return 0.5 + Math.sin(Math.PI * t) * 2.5; // khoảng 0.5x đến 3x

      case 'effect:fastSlowFast':
        // y = 3 - sin(pi * t)
        return 0.5 + (1 - Math.sin(Math.PI * t)) * 2.5;

      default:
        if (effectType?.startsWith('speed:')) {
          const raw = effectType.split(':')[1].replace('x', '');
          return parseFloat(raw);
        }
        return 1;
    }
  }, [effectType, screenDuration]);

  return getSpeedAt;
}
