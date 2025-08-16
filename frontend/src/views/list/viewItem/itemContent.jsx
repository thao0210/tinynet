import themeClasses from './themes.module.scss';
import { getActiveContent } from "@/utils/lang";
import { getTitleByLang } from "@/utils/lang";
import CardPreview from "../newItem/itemTypes/card/cardPreview";
import { useRef, useState, useEffect } from 'react';
import { CountdownDateTime } from "@/components/countdown";
import ItemCollection from "./itemCollection";
import ItemPlay from "./itemPlay";
import star from "@/assets/star.svg";
import { useStore } from '@/store/useStore';
import { MdDeleteForever, MdOutlinePostAdd } from "react-icons/md";
import Tippy from '@tippyjs/react';
import UserAvatar from '../../../components/userAvatar';
import { FaEdit } from 'react-icons/fa';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';

const ItemContent = ({item, activeLang, setShowComments, showComments, navigate, metaData, colItems, setShowContributionModal, contributionList, setCurContributionId, setLoadViewContent}) => {
    const [showResults, setShowResults] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);
    const {user} = useStore();
    const commentOnClick = () => setShowComments(!showComments);
    const onDelete = async (id) => {
        const confirm = window.confirm('Are you sure you want to delete this contribution?');
        if (confirm) {
            try {
                const deleteContri = api.delete(`${urls.CONTRIBUTION}/${id}`);
                if (deleteContri) {
                    toast.success('Contribution has been removed!');
                    setLoadViewContent(true);
                }
            } catch (err) {
                console.log(err);
            }
        }
        
    }
    return (
        <>
            {
                item.type !== 'card' ? (
                    <div className={themeClasses.content} id='story-content'>
                        {
                            item.type === 'story' &&
                            <div className={themeClasses.audio}>
                                <ItemPlay text={getActiveContent(activeLang, item)?.text} lang={activeLang} isUser={user} />
                                {
                                    item.allowContribution && user &&
                                    <Tippy content='Add your own content'>
                                    <span onClick={() => setShowContributionModal(true)}>
                                        <MdOutlinePostAdd size={20} />
                                    </span>
                                    </Tippy>
                                }
                            </div>
                        }
                        
                        <div className={themeClasses.itemContent}>
                            <h1>
                            {
                                item.showTitle && item?.translations?.length > 0 ? getTitleByLang(item, activeLang) : item.showTitle ? item.title : ''
                            }
                            </h1>
                            {
                                contributionList.length > 0 && contributionList.filter(itm => itm.lang === activeLang)?.length > 0 &&
                                <div className={themeClasses.contributions}>
                                    {
                                        contributionList.filter(itm => itm.lang === activeLang).map((it, index)  => (
                                            <a key={`contrianchor${index+1}`} href={`#contri${index+1}`}>#{index+1}</a>
                                        ))
                                    }
                                </div>
                            }
                            {
                                item.type === 'story' && 
                                <>
                                <div dangerouslySetInnerHTML={{__html: getActiveContent(activeLang, item)?.content}} />
                                {
                                    contributionList.length > 0 && contributionList.map((itm, index) => {
                                        if (itm.lang === activeLang) return (
                                            <div id={`contri${index+1}`} key={`contri${index+1}`} className={themeClasses.contributionsContent}>
                                                {itm.userId && (
                                                    <div>
                                                    <UserAvatar
                                                        avatar={itm.userId.avatar || ''}
                                                        name={itm.userId?.fullName || itm.userId?.username}
                                                        date={itm.updatedAt || itm.createdAt}
                                                        profileId={itm.userId._id}
                                                        isAnonymous={itm.isAnonymous}
                                                    />
                                                    {
                                                        user && user._id === itm.userId?._id &&
                                                        <div className={themeClasses.controls}>
                                                            <FaEdit onClick={() => {
                                                                setShowContributionModal(true);
                                                                setCurContributionId(itm._id);
                                                            }} />
                                                            <MdDeleteForever onClick={() => onDelete(itm._id)} size={25} />
                                                        </div>
                                                    }
                                                    
                                                    </div>
                                                )}
                                                <div dangerouslySetInnerHTML={{__html: getActiveContent(activeLang, itm)?.content}} key={`contri${index}`} />
                                            </div>
                                        );
                                        return '';
                                    })
                                }
                                </>
                            }
                            {
                                item.type === 'vote' && item.description && 
                                <p style={{textAlign: 'center'}}>
                                    {item.description}
                                </p>
                            }
                            {
                                item.type === 'vote' && 
                                <div className={themeClasses.voteMode}>
                                    <div>
                                        <span>Select</span>
                                        <div>{item.voteMode}</div>
                                    </div>
                                    <CountdownDateTime deadline={item.deadline} userTimezone={user?.timezone || localStorage.getItem("timezone") || 'UTC'} setShowResults={setShowResults} setIsTimeout={setIsTimeout} />
                                    <div>
                                        <span>Reward for each voter</span>
                                        <div>{item.voteReward} <img src={star} height={20} /></div>
                                    </div>
                                </div>
                            }
                            {
                                ['collection', 'vote'].includes(item.type) && colItems && colItems.length > 0 &&
                                <ItemCollection colItems={colItems} isVote={item.type === 'vote'} id={item._id} showResults={showResults} setShowResults={setShowResults} isTimeout={isTimeout}
                                authorId={item.author && item.author._id} voteMode={item.voteMode} alreadyVoted={item.itemsView && item.itemsView.some(iv =>
                                    iv.votedUsers.includes(user?._id)
                                )}/>
                            }
                            {
                                item.type === 'shareUrl' && metaData &&
                                (
                                    <div className="metadata-preview" onClick={() => window.open(metaData.url, "_blank")}>
                                        <img src={metaData.image} alt="Preview" />
                                        <h3>{metaData.title}</h3>
                                        <p>{metaData.description}</p>
                                    </div>
                                )
                            }
                            {
                                item.type === 'draco' && item.imageUrl &&
                                <div>
                                    <img src={item.imageUrl} alt="draco" style={{maxWidth: 800}} />
                                </div>
                            }
                        </div>
                    </div>
                ) : (
                    <CardPreview data={item.cardDetails} onClose={() => navigate('/list')} item={item} commentOnClick={commentOnClick} />
                )
            }
        </>
    )
}

export default ItemContent;