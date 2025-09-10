// ViewItem/ItemHeader.jsx
import { ViewIcon} from '@/components/listComponents/icons';
import { BsGridFill } from 'react-icons/bs';
import Tippy from '@tippyjs/react';
import themeClasses from './themes.module.scss';
import classNames from 'classnames';
import { ItemMenus } from '@/components/listComponents/itemMenus';
import { useVote } from '@/contexts/voteContext';
import ItemPlay from "./itemPlay";
import { getActiveContent } from "@/utils/lang";
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { useEffect, useRef, useState } from 'react';

const ItemHeader = ({ item, user, views, navigate, activeLang }) => {
    const { votes} = useVote();
    const onToggleMute = () => setIsMuted(!isMuted);
    const audioRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    useEffect(() => {
        if (item?.backgroundMusic && audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.volume = isMuted ? 0 : 1;

            const playAudio = async () => {
                try {
                    await audioRef.current.play();
                } catch (err) {
                    console.warn('Autoplay was prevented:', err);
                }
            };

            playAudio();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [item?.backgroundMusic, isMuted]);
    return (
        <div className={classNames(themeClasses.infos, 'infos')}>
            {views > 0 && <ViewIcon views={views} />}
            {
                item?.backgroundMusic &&
                <Tippy content={isMuted ? 'Unmute music' : 'Mute music'}>
                    <span className={classes.bgMusic} onClick={onToggleMute}>
                        {isMuted ? <HiSpeakerXMark size={21} /> : <HiSpeakerWave size={21} />}
                    </span>
                </Tippy>
            }
            {
                item.type === 'story' &&
                <>
                    <ItemPlay text={getActiveContent(activeLang, item)?.text} lang={activeLang} isUser={user} />
                    {
                        item.allowContribution && user &&
                        <Tippy content='Add your own content'>
                        <span onClick={() => setShowContributionModal(true)}>
                            <MdOutlinePostAdd size={20} />
                        </span>
                        </Tippy>
                    }
                </>
            }
            <ItemMenus
                item={item}
                isView
                isMyPost={user?.username === item?.author?.username}
                isUser={user}
                hasVote={!!(votes.length)}
            />
            <Tippy content="Back to list">
                <span className={themeClasses.viewList} onClick={() => navigate('/list')}>
                    ✕
                </span>
            </Tippy>
            {item?.backgroundMusic && (
                <audio
                    ref={audioRef}
                    src={item.backgroundMusic}
                    style={{ display: 'none' }} // hoặc: width: 0, height: 0
                    preload="auto"
                />
            )}
        </div>
    );
};

export default ItemHeader;
