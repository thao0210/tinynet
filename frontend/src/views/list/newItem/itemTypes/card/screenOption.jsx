import { useState, useEffect } from "react";
import Dropdown from '@/components/dropdown';
import Modal from '@/components/modal';
import classes from './styles.module.scss';
import FileUploader from "@/components/fleUpload";
import CameraCapture from "@/components/cameraCapture";
import Tippy from '@tippyjs/react';
import { extractThumbnailFromVideo } from "@/utils/extractThumbnailFromVideo";
import { FaCameraRetro, FaImage, FaUpload, FaVideo } from "react-icons/fa";

const ScreenOption = ({ screens, setScreens, setShowScreenOptions, activeScreenIndex }) => {
    const baseUrl = import.meta.env.VITE_R2_BASE_URL;
    const videosUrl = import.meta.env.VITE_R2_VIDEOS_URL;

    const imageArray = Array.from({ length: 64 }, (_, i) => `${baseUrl}/card-bg/${i + 1}.webp`);
    const videoImagesArray = Array.from({ length: 40 }, (_, i) => `${baseUrl}/videos/v${i + 1}.webp`);
    const videoArray = Array.from({ length: 40 }, (_, i) => ({
        videoUrl: `${videosUrl}/v${i + 1}.mp4`,
        thumbUrl: videoImagesArray[i],
        duration: null,
    }));

    const [videos, setVideos] = useState(videoArray);

    const ensureBackground = (screen) => {
        if (!screen.background) {
            screen.background = { color: '', url: '', file: null };
        }
        if (!screen.background.uploadType) {
            screen.background.uploadType = 'image';
        }
        if (!screen.background.customType) {
            screen.background.customType = 'upload';
        }
    };

    const onSelectBackground = async (type, value, file, hideModal = false) => {
        const updated = [...screens];
        const screen = updated[activeScreenIndex];
        ensureBackground(screen);

        screen.background.type = type;
        screen.background.url = value;
        screen.background.file = file;

        if (type === 'video') {
            const thumbFile = await extractThumbnailFromVideo(file || value);
            const thumbUrl = URL.createObjectURL(thumbFile);
            screen.thumbnail = thumbUrl;
        } else {
            screen.thumbnail = value;
        }

        setScreens(updated);
        if (hideModal) setShowScreenOptions(false);
    };

    const onFileSelect = (file) => {
        const uploadType = screens[activeScreenIndex]?.background?.uploadType || 'image';
        const objectURL = URL.createObjectURL(file);
        onSelectBackground(uploadType, objectURL, file);
    };

    useEffect(() => {
        const loadMetadata = async () => {
            const updated = [...videos];

            await Promise.all(
            updated.map((v, idx) => {
                return new Promise((resolve) => {
                const video = document.createElement('video');
                video.src = v.videoUrl;
                video.addEventListener('loadedmetadata', () => {
                    updated[idx].duration = video.duration.toFixed(1);
                    resolve();
                });
                video.addEventListener('error', () => resolve()); // tránh treo promise
                });
            })
            );

            setVideos(updated); // ✅ chỉ set 1 lần sau khi tất cả metadata đã có
        };

        loadMetadata();
    }, []);


    useEffect(() => {
        if (screens[activeScreenIndex]?.backgroundType === 'No image/video') {
            onSelectBackground(null, null);
        }
    }, [screens[activeScreenIndex]?.backgroundType]);

    const screen = screens[activeScreenIndex];
    ensureBackground(screen);
    const bg = screen?.background || {};
    const uploadType = bg.uploadType;
    const customType = bg.customType;

    const setUploadType = (type) => {
        const updated = [...screens];
        updated[activeScreenIndex].background.uploadType = type;
        setScreens(updated);
    };

    const setCustomType = (type) => {
        const updated = [...screens];
        updated[activeScreenIndex].background.customType = type;
        setScreens(updated);
    };

    const onCapture = ({type, file}) => {
        const objectURL = URL.createObjectURL(file);
        onSelectBackground(type, objectURL, file, true);
    };
 
    return (
        <Modal setShowModal={setShowScreenOptions} width={screen.backgroundType === 'custom' ? 400 : 730}>
            <div className={classes.cardBgList}>
                <h2>Screen {activeScreenIndex + 1}</h2>
                <div className={classes.options} id='screen-options'>
                    <div className={classes.content}>
                        {screen.backgroundType === 'image' && (
                            <>
                                <label>Select background image</label>
                                <div className={classes.tabContent}>
                                    {imageArray.map((item, index) => (
                                        <div
                                            key={`theme${index}`}
                                            className={bg.url === item ? classes.active : ''}
                                        >
                                            <img
                                                src={item}
                                                alt='theme'
                                                onClick={() => onSelectBackground('image', item, null, true)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {screen.backgroundType === 'video' && (
                            <div className={classes.tabContent}>
                                {videos.map((v, index) => (
                                    <div
                                        key={index}
                                        className={bg.url === v.videoUrl ? classes.active : ''}
                                    >
                                        <img
                                            src={v.thumbUrl}
                                            alt={`thumb${index}`}
                                            onClick={() => onSelectBackground('video', v.videoUrl, null, true)}
                                        />
                                        <span className={classes.duration}>
                                            {v.duration ? `${v.duration}s` : '...'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {screen.backgroundType === 'custom' && (
                            <>
                            <div className={classes.heading}>
                                <Tippy content='Upload'>
                                <span onClick={() => setCustomType('upload')} className={customType === 'upload' ? classes.active : ''}>
                                    <FaUpload />
                                </span>
                                </Tippy>
                                <Tippy content='Camera'>
                                <span onClick={() => setCustomType('camera')} className={customType === 'camera' ? classes.active : ''}>
                                    <FaCameraRetro />
                                </span>
                                </Tippy>
                                
                            </div>
                            <div className={classes.uploadBox}>
                                <div>
                                    <label>Type</label>
                                    <Dropdown
                                        curValue={uploadType}
                                        list={[
                                            {
                                                value: 'image',
                                                label: <FaImage />,
                                                tippy: 'Photo'
                                            }, 
                                            { 
                                                value: 'video',
                                                label: <FaVideo />,
                                                tippy: 'Video'
                                            }]}
                                        onSelect={setUploadType}
                                        dropdownContainerSelector="#screen-options"
                                        width={40}
                                    />
                                </div>
                                {
                                    customType === 'upload' ?
                                    <FileUploader
                                        type={uploadType}
                                        onFileSelect={onFileSelect}
                                    />
                                :
                                <CameraCapture onCapture={onCapture} type={uploadType} setType={setUploadType} />
                                }
                            </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ScreenOption;