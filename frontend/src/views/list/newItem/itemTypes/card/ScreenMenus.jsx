import Tippy from "@tippyjs/react";
import { forwardRef, useState } from "react";
import classes from './styles.module.scss';
import { FaGear } from "react-icons/fa6";
import Dropdown from '@/components/dropdown';
import GradientPicker from "@/components/gradientPicker";
import { FaClock, FaImage, FaMagic, FaVideo } from "react-icons/fa";
import { FiClock, FiRepeat } from "react-icons/fi";
import { MdDashboardCustomize, MdSpeed } from "react-icons/md";
import { VideoSpeeds } from "@/sharedConstants/data";
import Checkbox from '@/components/checkbox';
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { AiOutlineStop } from "react-icons/ai";

const TRANSITIONS = ['none', 'fade', 'slideLeft', 'slideRight', 'slideDown', 'slideUp', 'zoom', 'blur', 'flip', 'bounce'];
const BG_TYPE = [{
        label: <AiOutlineStop />,
        value: 'none',
        tippy: 'No background'
    }, 
    {
        label: <FaImage />,
        value: 'image',
        tippy: 'Image'
    },
    {
        label: <FaVideo />,
        value: 'video',
        tippy: 'Video'
    },
    {
        label: <MdDashboardCustomize />,
        value: 'custom',
        tippy: 'Custom'
    }];
const ScreenMenus = forwardRef(({ screens, setScreens, setActiveIndex, activeScreenIndex, setShowScreenOptions }, ref) => {
    const addTextbox = () => {
        const genId = () => Math.random().toString(36).substring(2, 9);
        const updatedScreens = [...screens];
        const screen = updatedScreens[activeScreenIndex];

        const boxWidth = 280;
        const boxHeight = 26;
        const contentBox = ref.current?.getBoundingClientRect();
        const x = contentBox ? (contentBox.width - boxWidth) / 2 : 100;
        const y = contentBox ? ((contentBox.height - boxHeight) / 2) - 80 : 100;

        screen.textboxes.push({
            id: genId(),
            x,
            y,
            width: boxWidth,
            height: boxHeight,
            offsetX: -boxWidth/2, // -width/2
            offsetY: -boxHeight/2,  // -height/2
            text: "Your text here",
            fontSize: '20px',
            fontFamily: 'Arial',
            textAlign: 'center',
            color: '#666666',
            textShadow: 'none',
            effect: 'typing',
            frame: {
                type: '',
                shape: '',
                fill: '',
                strokeColor: '',
                direction: 'none',
                shadow: false
            }
        });

        setScreens(updatedScreens);
        setActiveIndex(screen.textboxes.length - 1);
    };

    const handleGradientChange = (val) => {
        const updated = [...screens];
        const screen = updated[activeScreenIndex];

        if (!screen.background) {
            screen.background = { color: '', url: '', file: null };
        }

        screen.background.color = val;
        setScreens(updated);
    };

    const bgOnChange = (e) => {
        const updated = [...screens];
        const screen = updated[activeScreenIndex];

        if (!screen.background) {
            screen.background = { color: '', url: '', file: null };
        }

        screen.background.color = e.target.value;
        setScreens(updated);
    };

    const screen = screens[activeScreenIndex];
    const backgroundColor = screen?.background?.color || '#ffffff';

    return (
        <div className={classes.cardMenus}>
            <Dropdown
                trigger={
                    <Tippy content={`Screen ${activeScreenIndex + 1} settings`}>
                        <span className={classes.config}>
                            <FaGear size={23} />
                        </span>
                    </Tippy>
                }
                dropdownContainerSelector=".item-card"
                stopPropagation
                width={225}
                background='#FFFA'
            >
                {({ onClose }) => (
                <div className={classes.configs} id="screen-config">
                    <Tippy content='Screen type'>
                    <div>
                        <Dropdown
                            curValue={screen.backgroundType}
                            list={BG_TYPE}
                            onSelect={(type) => {
                                const updated = [...screens];
                                updated[activeScreenIndex].backgroundType = type;
                                setScreens(updated);
                                type !== 'none' && setShowScreenOptions?.('true');
                                onClose();
                            }}
                            dropdownContainerSelector="#screen-config"
                        />
                    </div>
                    </Tippy>
                    <Tippy content='Screen time (seconds)'>
                    <div>
                        <FaClock />
                        <input
                            type='number'
                            value={screen?.time || 5}
                            onChange={(e) => {
                                const updated = [...screens];
                                updated[activeScreenIndex].time = parseFloat(e.target.value);
                                setScreens(updated);
                            }}
                        />
                    </div>
                    </Tippy>
                    <Tippy content='Screen effect'>
                    <div>
                        <FaMagic />
                        <Dropdown
                            curValue={screen.transition}
                            list={TRANSITIONS}
                            onSelect={(val) => {
                                const updated = [...screens];
                                updated[activeScreenIndex].transition = val;
                                setScreens(updated);
                            }}
                            dropdownContainerSelector="#screen-config"
                            isSmallText
                        />
                    </div>
                    </Tippy>
                    {(screen.backgroundType === 'video' || (screen.backgroundType === 'custom' && screen.background?.uploadType ==='video' )) && (
                        <>
                            <Tippy content='Video starts at (second)'>
                            <div>
                                <FiClock />
                                <input
                                    type='number'
                                    value={screen?.background?.videoStartAt || 0}
                                    max={screen?.time - 1}
                                    min={0}
                                    width={60}
                                    onChange={(e) => {
                                        const updated = [...screens];
                                        if (!updated[activeScreenIndex].background) {
                                            updated[activeScreenIndex].background = {};
                                        }
                                        updated[activeScreenIndex].background.videoStartAt = parseFloat(e.target.value);
                                        setScreens(updated);
                                    }}
                                />
                            </div>
                            </Tippy>
                            <Checkbox
                                label={<FiRepeat size={14} />}
                                tippy={'Loop video'}
                                isCombine
                                isChecked={screen.background?.loopInScreenTime}
                                setIsChecked={(val) => {
                                    const updated = [...screens];
                                    if (!updated[activeScreenIndex].background) {
                                    updated[activeScreenIndex].background = {};
                                    }
                                    updated[activeScreenIndex].background.loopInScreenTime = val;
                                    setScreens(updated);
                                }}
                            /><br />
                            <Checkbox
                                label={<HiOutlineSpeakerWave size={18} />}
                                tippy={'Use video audio (if any)'}
                                isChecked={screen.useVideoAudio}
                                setIsChecked={(val) => {
                                    const updated = [...screens];
                                    updated[activeScreenIndex].useVideoAudio = val;
                                    setScreens(updated);
                                }}
                                isCombine
                            />
                            <Tippy content='Speed Effect'>
                            <div>
                                <MdSpeed size={18} />
                                <Dropdown
                                    curValue={screen.background?.speedEffect || 'speed:1x'}
                                    list={VideoSpeeds}
                                    onSelect={(val) => {
                                        const updated = [...screens];
                                        if (!updated[activeScreenIndex].background) {
                                        updated[activeScreenIndex].background = {};
                                        }
                                        updated[activeScreenIndex].background.speedEffect = val;
                                        setScreens(updated);
                                    }}
                                    dropdownContainerSelector="#screen-config"
                                    isSmallText
                                />
                            </div>
                            </Tippy>
                        </>
                    )}
                </div>
                )}
            </Dropdown>

            <Tippy content="Add text">
                <span onClick={addTextbox}>
                    <img src="/text.svg" width={22} />
                </span>
            </Tippy>

            <Dropdown
                trigger={
                    <Tippy content="Background Color">
                        <div className={classes.bgColor}>
                            <span style={{ background: backgroundColor }}>A</span>
                        </div>
                    </Tippy>
                }
                dropdownContainerSelector=".item-card"
                stopPropagation
                width={250}
            >
                <div className={classes.bg}>
                    <div>
                        <label>Color</label>
                        <input
                            type="color"
                            value={
                                backgroundColor.includes('gradient') ? '#000000' : backgroundColor
                            }
                            onChange={bgOnChange}
                        />
                    </div>
                    <div>
                        <label>Gradient</label>
                        <GradientPicker
                            initialValue={backgroundColor}
                            onChange={handleGradientChange}
                            autoUpdate
                        />
                    </div>
                </div>
            </Dropdown>
        </div>
    );
});

export default ScreenMenus;