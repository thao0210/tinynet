import { useRef, useState, useEffect } from 'react';
import styles from './dropdown.module.scss';
import classNames from "classnames";
import { FaPause, FaPlay } from 'react-icons/fa6';
import { testVoices } from '@/sharedConstants/testVoices';
import Tippy from '@tippyjs/react';

const ListContent = ({list, isSound = false, isVoice = false, curValue, onSelect, returnObj = false, showFont, name}) => {
    const audioRef = useRef(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [playingValue, setPlayingValue] = useState(null);
    
    const isObjectList = typeof list[0] === 'object';

    useEffect(() => {
        return () => {
        speechSynthesis.cancel();
        };
    }, []);

    const stopPreview = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.onended = null;
            audio.pause();
            audio.currentTime = 0;
        }
        setPlayingValue(null);
        speechSynthesis.cancel();
    };

    const playAudio = async (url, value) => {
        if (playingValue === value) {
            stopPreview();
            return;
        }

        stopPreview();

        const audio = new Audio(url);
        audioRef.current = audio;
        try {
            setPlayingValue(value);
            await audio.play(); // chờ play xong
            setPlayingValue(value);

            audio.onended = () => setPlayingValue(null);
        } catch (err) {
            console.error("Playback failed:", err);
            setPlayingValue(null);
        }
    };

    const findItemByValue = (val) => {
        if (!val || !list) return null;
        if (isObjectList) {
            const valueToCompare = typeof val === 'object' ? val.value : val;
            return list.find((item) => item.value === valueToCompare) || null;
        }
        return { value: val, label: val };
    };

    useEffect(() => {
        const matchedItem = findItemByValue(curValue);
        setCurrentItem(matchedItem);
      }, [curValue, list]);
    
    const handleSelect = (item) => {
        setCurrentItem(item);
        const value = returnObj
        ? item
        : typeof item === 'object' && item !== null
            ? item.value
            : item;

        onSelect?.(value, name);
        stopPreview();
    };
        
    return (
        <div
            className={styles.dropdownOptions}
            >
            <ul>
                {list.map((item) => {
                const value = isObjectList ? item.value : item;
                const label = isObjectList ? item.label : item;
                const isActive = currentItem?.value === value;

                const handlePlayToggle = (e) => {
                    e.stopPropagation();
                    if (playingValue === value) {
                        stopPreview();
                        return;
                    }
                    stopPreview();

                    if (isVoice) {
                        const testText = testVoices.find((t) => t.language === item.lang).text || "This is a test voice";
                        const utterance = new SpeechSynthesisUtterance(testText);
                        console.log(utterance);
                        const matchedVoice = speechSynthesis.getVoices().find(v => v.name === item.value);
                        if (matchedVoice) {
                            utterance.voice = matchedVoice;
                        }
                        if (item.lang) {
                            utterance.lang = item.lang; // đảm bảo đúng accent
                        }

                        utterance.onend = () => setPlayingValue(null);
                        utterance.onerror = () => setPlayingValue(null);

                        setPlayingValue(value);
                        speechSynthesis.speak(utterance);
                    } else {
                        playAudio(item.value, value);
                    }
                };

                return (
                    <Tippy content={item?.tippy} disabled={!item?.tippy} key={value}>
                        <li
                        className={classNames(styles.option, { [styles.active]: isActive })}
                        onClick={() => handleSelect(!isObjectList ? item : { value, label })}
                        style={{ fontFamily: showFont ? value : '' }}
                        >
                            {(isSound || isVoice) && (
                                <span onClick={handlePlayToggle}>
                                {playingValue === value ? <FaPause /> : <FaPlay />}
                                </span>
                            )}
                            {label}
                        </li>
                    </Tippy>
                );
                })}
            </ul>
            </div>
    )
}

export default ListContent;