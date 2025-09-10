import { useEffect, useRef, useState } from "react";
import classes from './styles.module.scss';
import themeClasses from './themes.module.scss';
import { useStore } from '@/store/useStore';
import Comments from "./comments";
import classNames from "classnames";
import { getBrightIndex } from "@/utils/color";
import {useNavigate, Outlet} from "react-router-dom";
import ItemHeader from './itemHeader';
import ItemThemes from './itemThemes';
import ItemContent from './itemContent';
import AddContribution from "./components/addContribution";
import Modal from '@/components/modal';
import Loader from '@/components/loader';
import NextBackNav from "@/components/nextBackNav";
import ItemVote from "./itemVote";
import { useItemWithParent } from "@/hooks/useItemWithParent";
import { VoteProvider } from "@/contexts/voteContext";
import ItemFooter from "./itemFooter";

const ViewItem = () => {
    const {user, loadViewContent, setLoadViewContent, allIds} = useStore();
    const { item, setItem, parent, contributions, loading, colItems } = useItemWithParent({ loadViewContent });
    
    const [showComments, setShowComments] = useState(false);
    const [metaData, setMetaData] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const navigate = useNavigate();
    const [activeLang, setActiveLang] = useState(item?.language || navigator.language || navigator.userLanguage || 'en-US');
    const [languages, setLanguages] = useState([]);
    const [showContributionModal, setShowContributionModal] = useState(false);
    const [curContributionId, setCurContributionId] = useState('');
    
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
                        navigate={navigate}
                        activeLang={activeLang}
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
                        <Comments item={item} setItem={setItem} setShowComments={setShowComments} />
                    }
                </>
            }
            {
                !loading && !item && 
                <div className="forbidden">Content is not available!</div>
            }
            
            <NextBackNav
                allIds={allIds}
                currentId={item?._id}
                parentId={parent?._id}
                item={item}
                onCommentClick={() => setShowComments(!showComments)}
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
            <ItemFooter item={item} activeLang={activeLang} setActiveLang={setActiveLang} languages={languages} />
            {
                parent?.type === "vote" && (() => {
                    const votedInfo = parent?.itemsView?.find(_item => _item.item === item._id);
                    const mergedItem = { ...item, ...votedInfo };
                    return <ItemVote item={mergedItem} />;
                })()
            }
            <Outlet />
        </div>
        </VoteProvider>
    )
    
}

export default ViewItem