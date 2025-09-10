import classes from './styles.module.scss';
import { motion } from 'framer-motion';
import { transitionPresets } from './effect';
import TextBoxPreview from './TextBoxPreview';
import { CommentIcon, LikeIcon, ViewIcon } from '@/components/listComponents/icons';
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { FaPause, FaPlay } from 'react-icons/fa';
import Tippy from '@tippyjs/react';
import UserAvatar from '@/components/userAvatar';
import { Languages } from '../generalComponents';

const CardPreviewScreens = ({
  screen,
  loopKey,
  isPause,
  isMuted,
  onTogglePause,
  onToggleMute,
  onClose,
  videoRef,
  item,
  hasMusic,
  // commentOnClick,
  cardTextContent,
  activeLang,
  setActiveLang,
  languages
}) => {
  const transition = transitionPresets[screen.transition] || transitionPresets.fade;

  return (
    <div className={classes.preview} style={{ background: screen.background.color }}>
      <button className={classes.closeButton} onClick={onClose}>✕</button>

      {screen.background?.type === 'video' && (
        <motion.video
          ref={videoRef}
          key={screen.repeat ? loopKey : screen.background.url}
          src={screen.background.url}
          className={classes.bgImage}
          autoPlay={false}
          loop={false}
          muted={!screen.useVideoAudio}
          playsInline
          initial={transition.initial}
          animate={transition.animate}
          transition={transition.transition}
        />
      )}

      {screen.background?.type === 'image' && (
        <motion.img
          key={screen.repeat ? loopKey : screen.background.url}
          src={screen.background.url}
          className={classes.bgImage}
          alt="bg"
          initial={transition.initial}
          animate={transition.animate}
          transition={transition.transition}
        />
      )}

      {screen.textboxes.map((box, idx) => (
        <TextBoxPreview
          key={idx}
          box={box}
          delay={Number(box.delay) || 0}
          loopKey={loopKey}
          isPause={isPause}
          cardTextContent={cardTextContent}
          currentLang={activeLang}
        />
      ))}

      <div className={classes.infos}>
        <Tippy content={isPause ? 'Play' : 'Pause'}>
        <span onClick={onTogglePause}>
          {isPause ? <FaPlay /> : <FaPause />}
        </span>
        </Tippy>
        {
            hasMusic &&
            <Tippy content={isMuted ? 'unMute' : 'Mute'}>
             <span onClick={onToggleMute}>
                {isMuted ? <HiSpeakerXMark size={21} /> : <HiSpeakerWave size={21} />}
            </span>
            </Tippy>
        }
        {
            item?.views > 0 &&
            <ViewIcon views={item.views} />
        }
      </div>
      
        <div className={classes.author}>
            {
              item?.author &&
              <UserAvatar
                  avatar={item.author?.avatar || ''}
                  name={item.author?.fullName || item.author?.username}
                  username={null}
                  date={item.date}
                  profileId={item.author?._id}
                  isAnonymous={item.isAnonymous}
              />
            }
            {
              languages.length > 1 &&
              <Languages
                  isView={true}
                  activeLang={activeLang}
                  setActiveLang={setActiveLang}
                  languages={languages}
                  onLanguageChange={(lang) => {
                      setActiveLang(lang);
                  }}
                  isCenter
              />
            }
        </div>
    </div>
  );
};

export default CardPreviewScreens;
