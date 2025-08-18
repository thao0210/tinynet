import classes from './styles.module.scss';
import { forwardRef, useRef, useEffect, useState } from "react";
import ScreenTextBox from './TextBox';
import { useVideoSpeedEffect } from '@/hooks/useVideoSpeedEffect';

const ScreenContent = forwardRef(({ screen, updateTextbox, activeIndex, setActiveIndex, deleteTextbox, showCardReview, cardTextContent, currentLang}, ref) => {
    const boxRefs = useRef([]);
    const getSpeedAt = useVideoSpeedEffect(screen?.background?.speedEffect || 'speed: 1x', screen?.time);
    const vRef = useRef(null);

    useEffect(() => {
        if (activeIndex != null && boxRefs.current[activeIndex]) {
            boxRefs.current[activeIndex].focus();
        }
    }, [activeIndex]);

    useEffect(() => {
        const videoEl = vRef.current;
        if (!videoEl) return;

        // Mute / loop update
        videoEl.muted = !(screen?.useVideoAudio);
        videoEl.loop = !!screen?.background?.loopInScreenTime;

        // Set start time nếu có
        if (typeof screen?.background?.videoStartAt === 'number') {
            videoEl.currentTime = screen.background.videoStartAt;
        }

        // Play lại nếu cần
        videoEl.play().catch(() => {});
    }, [
        screen?.useVideoAudio,
        screen?.background?.videoStartAt,
        screen?.background?.loopInScreenTime
    ]);

    useEffect(() => {
        const videoEl = vRef.current;
        if (!videoEl) return;

        let rafId;
        const updateSpeed = () => {
            const speed = getSpeedAt(videoEl.currentTime || 0);
            videoEl.playbackRate = speed;
            rafId = requestAnimationFrame(updateSpeed);
        };

        updateSpeed();

        return () => cancelAnimationFrame(rafId);
    }, [getSpeedAt]);
    
    return (
        <div className={classes.content} id='item-card' style={{ background: screen?.background?.color || '#000000' }} ref={ref}>
            {!showCardReview && screen?.backgroundType !== 'none' && screen?.background?.type === 'video' && (
                <video 
                    ref={vRef}
                    key={screen?.background.url}
                    src={screen?.background.url}
                    className={classes.bgImage} 
                    autoPlay
                    playsInline
                    muted
                    initial={screen?.transition.initial}
                    animate={screen?.transition.animate}
                    transition={screen?.transition.transition}
                />
            )}
            {
                !showCardReview && screen?.backgroundType !== 'none' && screen?.background?.type === 'image' && 
                <img src={screen?.background?.url} className={classes.bgImage} alt="bg" />
            }
            {screen?.textboxes.map((box, index) => (
                <ScreenTextBox 
                    box={box} 
                    activeIndex={activeIndex} 
                    index={index} 
                    key={index} 
                    boxRefs={boxRefs} 
                    updateTextbox={updateTextbox}
                    setActiveIndex={setActiveIndex}
                    deleteTextbox={deleteTextbox}
                    screen={screen}
                    cardTextContent={cardTextContent}
                    currentLang={currentLang}
                 />
            ))}
        </div>
    );
});

export default ScreenContent;