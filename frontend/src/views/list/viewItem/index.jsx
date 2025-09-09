import { useEffect, useRef, useState } from "react";
import classes from './styles.module.scss';
import themeClasses from './themes.module.scss';
import { useStore } from '@/store/useStore';
import Comments from "./comments";
import classNames from "classnames";
import { getBrightIndex } from "@/utils/color";
import {useParams, useNavigate, Outlet} from "react-router-dom";
import { Languages } from "../newItem/itemTypes/generalComponents";
import ItemHeader from './itemHeader';
import ItemThemes from './itemThemes';
import ItemContent from './itemContent';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import Tippy from '@tippyjs/react';
import AddContribution from "./components/addContribution";
import Modal from '@/components/modal';
import Loader from '@/components/loader';
import NextBackNav from "@/components/nextBackNav";
import ItemVote from "./itemVote";
import { useItemWithParent } from "@/hooks/useItemWithParent";
import { VoteProvider } from "@/contexts/voteContext";

const ViewItem = () => {
    const {user, loadViewContent, setLoadViewContent, allIds} = useStore();
    const { item, parent, contributions, loading, colItems } = useItemWithParent({ loadViewContent });
    
    const [showComments, setShowComments] = useState(false);
    const [metaData, setMetaData] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const navigate = useNavigate();
    const [activeLang, setActiveLang] = useState(item?.language || navigator.language || navigator.userLanguage || 'en-US');
    const [languages, setLanguages] = useState([]);
    const [isMuted, setIsMuted] = useState(true);
    const [showContributionModal, setShowContributionModal] = useState(false);
    const [curContributionId, setCurContributionId] = useState('');
    const onToggleMute = () => setIsMuted(!isMuted);

    useEffect(() => {
        if (item?.themeType === 'colors' && item?.theme) {
            setIsDark(getBrightIndex(item.theme) < 150);
        }
        if (item?.preview) {
            setMetaData(JSON.parse(item.preview));
        }
        if (item?.translations?.length) {
            const allLangs = [item.language, ...item.translations.map(t => t.lang)].filter(Boolean);
            setLanguages([...new Set(allLangs)]);
        }
    }, [item]);

    const audioRef = useRef(null);
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
        <VoteProvider
            initialConfig={{
                deadline: item?.deadline || null,
                voteMode: item?.voteMode || null,
                isTimeout: false,
                disabled: false,
            }}
    >
        <div className={classNames(classes.viewItem, 'viewItem', {['embed']: item?.type === 'shareUrl'}, themeClasses.theme, themeClasses[item?.theme], {[themeClasses.dark]: isDark, [themeClasses.light]: !isDark && item?.themeType === 'colors'})} style={{background: ['colors', 'gradient'].includes(item?.themeType) && item?.theme ? item?.theme : ''}}>
            <ItemThemes item={item} />
            {
                loading &&
                <Loader />
            }
            {
                !loading && item &&
                <>
                    <ItemHeader
                        item={item}
                        user={user}
                        views={item.views}
                        onCommentClick={() => setShowComments(!showComments)}
                        navigate={navigate}
                        // isModal={!!id}
                    />
                    <ItemContent 
                        item={item}
                        activeLang={activeLang}
                        setShowComments={setShowComments}
                        showComments={showComments}
                        navigate={navigate}
                        metaData={metaData}
                        colItems={colItems}
                        setShowContributionModal={setShowContributionModal}
                        contributionList={contributions}
                        setCurContributionId={setCurContributionId}
                        setLoadViewContent={setLoadViewContent}
                    />
                    
                    {
                        item.allowComments && showComments &&
                        <Comments item={item} setShowComments={setShowComments} />
                    }
                </>
            }
            {
                !loading && !item && 
                <div className="forbidden">Content is not available!</div>
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
                />
            }
            {
                !loading && item?.backgroundMusic &&
                <Tippy content={isMuted ? 'Unmute music' : 'Mute music'}>
                    <span className={classes.bgMusic} onClick={onToggleMute}>
                        {isMuted ? <HiSpeakerXMark size={21} /> : <HiSpeakerWave size={21} />}
                    </span>
                </Tippy>
            }
            {!loading && item?.backgroundMusic && (
                <audio
                    ref={audioRef}
                    src={item.backgroundMusic}
                    style={{ display: 'none' }} // hoặc: width: 0, height: 0
                    preload="auto"
                />
            )}
            <NextBackNav
                allIds={allIds}
                currentId={item?._id}
                parentId={parent?._id}
                onNavigate={(id, parentId) => {
                    if (parentId) {
                        navigate(`/post/${parentId}/${id}`);
                    } else {
                        navigate(`/post/${id}`); 
                    }
                }}
            />
            {
                !loading && showContributionModal &&
                <Modal onClose={() => setShowContributionModal(null)} isFull>
                    <AddContribution 
                        activeLang={activeLang} 
                        item={item} 
                        curContributionId={curContributionId}
                        setLoadViewContent={setLoadViewContent}
                        setShowContributionModal={setShowContributionModal}
                     />
                </Modal>
            }
            <Outlet />
            {
                parent?.type === "vote" && (() => {
                    const votedInfo = parent?.itemsView?.find(_item => _item.item === item._id);
                    const mergedItem = { ...item, ...votedInfo };
                    return <ItemVote item={mergedItem} />;
                })()
            }
        </div>
        </VoteProvider>
    )
    
}

export default ViewItem