import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';

export const useAudioMixer = ({
  musicUrl,
  musicFormat,
  naturalSounds = [],
  isPause = false,
  isMuted = false,
}) => {
  const musicRef = useRef(null);
  const naturalRefs = useRef([]);
  const lastUrl = useRef(null);
  const lastNatural = useRef(null);
  const timeouts = useRef([]);

  const cleanupMusic = () => {
    if (musicRef.current) {
      musicRef.current.stop();
      musicRef.current.unload();
      musicRef.current = null;
    }
  };

  const cleanupNaturalSounds = () => {
    naturalRefs.current.forEach(howl => {
      howl.stop();
      howl.unload();
    });
    naturalRefs.current = [];
  };

  // Init nhạc và natural sounds (chỉ chạy khi url/sound thay đổi)
  useEffect(() => {
    const musicChanged = lastUrl.current !== musicUrl;
    const naturalChanged = JSON.stringify(lastNatural.current) !== JSON.stringify(naturalSounds);

    if (!musicChanged && !naturalChanged) return;

    if (musicChanged) {
      cleanupMusic();
      lastUrl.current = musicUrl;

      if (musicUrl) {
        musicRef.current = new Howl({
          src: [musicUrl],
          format: musicFormat ? [musicFormat] : undefined,
          volume: 0.5,
          loop: true,
        });

        if (!isPause && !isMuted) {
          musicRef.current.play();
        }
      }
    }

    if (naturalChanged) {
      cleanupNaturalSounds();
      lastNatural.current = naturalSounds;

      naturalSounds.forEach((sound) => {
        const howl = new Howl({
          src: [sound.url],
          format: sound.format,
          volume: sound.volume ?? 0.8,
          loop: sound.loop ?? false,
        });

        if (!isPause && !isMuted) {
          if (sound.delay) {
            const id = setTimeout(() => howl.play(), sound.delay * 1000);
            timeouts.current.push(id);
          } else {
            howl.play();
          }
        }

        naturalRefs.current.push(howl);
      });
    }
  }, [musicUrl, musicFormat, naturalSounds]);

  // Xử lý pause / resume (chạy riêng khi isPause thay đổi)
  useEffect(() => {
    if (isPause) {
      musicRef.current?.pause();
      naturalRefs.current.forEach(h => h.pause());
    } else {
      musicRef.current?.play();
      naturalRefs.current.forEach(h => h.play());
    }
  }, [isPause]);

  // Mute toàn bộ hệ thống
  useEffect(() => {
    Howler.mute(isMuted);

    if (!isMuted && !isPause) {
      // Khi unmute thì đảm bảo play
      musicRef.current?.play();
      naturalRefs.current.forEach(h => h.play());
    }
  }, [isMuted]);

  // Expose stop từ bên ngoài
  const stop = () => {
    cleanupMusic();
    cleanupNaturalSounds();
    timeouts.current.forEach(id => clearTimeout(id));
    timeouts.current = [];
  };

  return { stop };
};
