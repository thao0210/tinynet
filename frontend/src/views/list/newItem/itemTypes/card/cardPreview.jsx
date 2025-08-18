import { useEffect, useRef, useState } from 'react';
import { useAudioMixer } from '@/hooks/useAudioMixer';
import CardPreviewScreens from './cardPreviewScreens';
import { useVideoSpeedEffect } from '@/hooks/useVideoSpeedEffect';
import {useStore} from '@/store/useStore';

const CardPreview = ({ data, onClose, uploadedMusicFile, item, commentOnClick, cardTextContent}) => {
  const [screenIndex, setScreenIndex] = useState(0);
  const [loopKey, setLoopKey] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const videoRef = useRef();
  const loopTimerRef = useRef(null);
  const screen = data.screens[screenIndex];
  const getSpeedAt = useVideoSpeedEffect(screen.background?.speedEffect || 'speed: 1x', screen.time);
  const {user} = useStore();
  const [activeLang, setActiveLang] = useState(user.lang || navigator.language || 'en-US');
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    if (cardTextContent) {
      setLanguages(Object.keys(cardTextContent));
    }
  }, [cardTextContent]);

  const { stop } = useAudioMixer({
    musicUrl: data.music?.url,
    musicFormat: uploadedMusicFile?.extension || undefined,
    naturalSounds: data.naturalSounds,
    isMuted,
    isPause
  });

  const stopAllSounds = () => {
    stop();
  };

  const handleClose = () => {
    stopAllSounds();
    onClose?.();
  };

  const pauseLoop = () => {
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  };

  const resumeLoop = () => {
    const currentScreen = data.screens[screenIndex];
    loopTimerRef.current = setTimeout(() => {
      const nextIndex = (screenIndex + 1) % data.screens.length;
      setScreenIndex(nextIndex);
      setLoopKey(prev => prev + 1);
    }, currentScreen.time * 1000);
  };

  useEffect(() => {
    if (!data?.screens?.length) return;

    if (isPause) {
      pauseLoop();
    } else {
      resumeLoop();
    }

    return () => {
      pauseLoop();
    };
  }, [screenIndex, isPause, data]);

  useEffect(() => {
    const video = videoRef.current;
    // const screen = data.screens[screenIndex];
    const bg = screen.background || {};

    if (!video || bg.type !== 'video') return;

    const videoStartAt = bg.videoStartAt || 0;
    const loopInScreenTime = bg.loopInScreenTime;

    const handleVideoLoop = () => {
      if (loopInScreenTime && !isPause) {
        video.currentTime = videoStartAt;
        video.play().catch(() => {});
      }
    };

    const setupVideo = () => {
      video.currentTime = videoStartAt;
      video.play().catch(() => {});
      video.addEventListener('ended', handleVideoLoop);
    };

    if (video.readyState >= 1) {
      setupVideo();
    } else {
      const handleLoaded = () => {
        setupVideo();
        video.removeEventListener('loadedmetadata', handleLoaded);
      };
      video.addEventListener('loadedmetadata', handleLoaded);
    }

    return () => {
      video.removeEventListener('ended', handleVideoLoop);
    };
  }, [screenIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPause) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isPause]);

  useEffect(() => {
  if (!videoRef.current || screen.background?.speedEffect?.startsWith('speed:')) return;

  let rafId;
  const update = () => {
    const video = videoRef.current;
    if (video) {
      const current = video.currentTime;
      const newSpeed = getSpeedAt(current);
      if (video.playbackRate !== newSpeed) {
        video.playbackRate = newSpeed;
      }
    }
    rafId = requestAnimationFrame(update);
  };
    update();
    return () => cancelAnimationFrame(rafId);
  }, [getSpeedAt]);


  if (!data?.screens?.length) return <div>No preview available</div>;

  console.log('active lang', activeLang);
  return (
    <CardPreviewScreens
      screen={data.screens[screenIndex]}
      loopKey={loopKey}
      isPause={isPause}
      isMuted={isMuted}
      onTogglePause={() => setIsPause(!isPause)}
      onToggleMute={() => setIsMuted(!isMuted)}
      onClose={handleClose}
      videoRef={videoRef}
      item={item}
      hasMusic={data.music?.url || data.naturalSounds.length > 0}
      commentOnClick={commentOnClick}
      cardTextContent={cardTextContent}
      languages={languages}
      activeLang={activeLang}
      setActiveLang={setActiveLang}
    />
  );
};

export default CardPreview;
