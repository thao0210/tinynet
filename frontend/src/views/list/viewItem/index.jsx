import { useEffect, useRef, useState } from "react";
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import classes from './styles.module.scss';
import themeClasses from './themes.module.scss';
import { useStore } from '@/store/useStore';
import Comments from "./comments";
import classNames from "classnames";
import { getBrightIndex } from "@/utils/color";
import {useParams, useNavigate} from "react-router-dom";
import { Languages } from "../newItem/itemTypes/generalComponents";
import ItemHeader from './itemHeader';
import ItemThemes from './itemThemes';
import ItemContent from './itemContent';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import Tippy from '@tippyjs/react';
import AddContribution from "./components/addContribution";
import Modal from '@/components/modal';
import Loader from '@/components/loader';

const ViewItem = ({itemId}) => {
    const [item, setItem] = useState(null);
    const [iId, setIID] = useState('');
    const {setLoading, loading, showModal, user, loadViewContent, setLoadViewContent} = useStore();
    const [showComments, setShowComments] = useState(false);
    const [metaData, setMetaData] = useState(null);
    const [colItems, setColItems] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    const [activeLang, setActiveLang] = useState(item?.language || navigator.language || navigator.userLanguage || 'en-US');
    const [languages, setLanguages] = useState([]);
    const [isMuted, setIsMuted] = useState(true);
    const [showContributionModal, setShowContributionModal] = useState(false);
    const [curContributionId, setCurContributionId] = useState('');
    const [contributionList, setContributionList] = useState([]);

    const onToggleMute = () => setIsMuted(!isMuted);
    useEffect(() => {
        const fetchItem = async () => {
            if (!iId) return;
            setLoading(true);
            try {
                const res = await api.get(`${urls.LIST}/${iId}`);
                const { item, items } = res.data || {};
                if (item) {
                    setItem(item);
                    items && setColItems(items);

                    if (!user || (user && user.username !== item.author?.username)) {
                        await api.post(`${urls.LIST}/${iId}/views`);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadViewContent(false);
                setLoading(false);
            }
        };

        const getContributions = async () => {
            if (!iId) return;
            try { 
                const list = await api.get(`${urls.CONTRIBUTION}/list/${iId}`);
                if (list.data) {
                    setContributionList(list.data);
                }
            } catch(err) {
                console.log(err);
            }
        }

        fetchItem();
        getContributions();
    }, [iId, loadViewContent]);

    useEffect(() => {
        const idFromUrl = itemId || params.id || showModal?.split('-')?.[1];
        if (idFromUrl) setIID(idFromUrl);
    }, [itemId, params.id, showModal]);

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
                        isModal={params.id && !itemId}
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
                        contributionList={contributionList}
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
            {
                !loading && showContributionModal &&
                <Modal setShowModal={setShowContributionModal} isFull>
                    <AddContribution 
                        activeLang={activeLang} 
                        item={item} 
                        curContributionId={curContributionId}
                        setLoadViewContent={setLoadViewContent}
                        setShowContributionModal={setShowContributionModal}
                     />
                </Modal>
            }
        </div>
    )
}

export default ViewItem