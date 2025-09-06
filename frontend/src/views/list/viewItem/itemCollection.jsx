import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import UserAvatar from '@/components/userAvatar';
import ItemVote, { VoteResults } from './itemVote';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';
import themeClasses from './themes.module.scss';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { ItemType } from '@/components/listComponents/itemType';
import { getTitleByLang } from '@/utils/lang';

const ItemCollection = ({colItems, isVote, id, showResults, setShowResults, isTimeout, authorId, voteMode, alreadyVoted}) => {
    const {user, setShowModal, curTheme, setAllIds} = useStore();
    const [votes, setVotes] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const navigate = useNavigate();

    const onItemClick = (item) => {
        setAllIds(colItems.map(item => item._id));
        navigate(`/post/${id}/${item._id}?isVote=${isVote}`);
    }

    const callVote = async () => {
        if (!user) {
            setShowModal('login');
            return;
        }
        const vote = await api.post(`${urls.VOTE_ITEM}/${id}`, {
            userId: user._id,
            votedItemId: votes.map(el => el.id)
        });
        if (vote.data) {
            toast.success('Vote successfully!');
            setDisabled(true);
        }
    }

    useEffect(()=>{
        if (alreadyVoted && voteMode === 'only-one') {
            setDisabled(true);
        }
    }, [alreadyVoted]);

    return (
        <>
            {
                votes.length > 0 && !disabled &&
                <div className={themeClasses.confirmVote}>
                    Chosen {votes.length} item{votes.length > 1 ? 's' : ''}: <strong>{votes.map(el => el.name).join(', ')}</strong>. <button className="btn" onClick={callVote}>Vote {votes.length > 1 ? 'these' : 'this'} item{votes.length > 1 ? 's' : ''}</button> 
                </div>
            }
            {
                showResults &&
                <VoteResults id={id} authorId={authorId} />
            }
            <ul className={classNames(themeClasses.collectionItems, curTheme)}>
                {
                    colItems.map((item, index) => 
                        <li key={`item${index}`} className={classNames(`item${index%12}`, item.type)}>
                            <div onClick={() => onItemClick(item, index)}>
                                {
                                    item.showTitle &&
                                    <h3>
                                        {
                                            item.type === "card"
                                            ? (item.cardMeta?.[navigator.language]?.title || "card")
                                            : (item?.translations?.length > 0
                                                ? getTitleByLang(item, navigator.language)
                                                : (item?.title || ""))
                                        }
                                        {item.type === 'collection' && item.items && item.items.length ? <sup>{item.items.length}</sup>: ''}
                                    </h3>                                                                                                                                
                                }
                                <ItemType item={item} />
                            </div>
                            <div className={themeClasses.itemInfos}>
                                <UserAvatar
                                    avatar={item.author.avatar || ''}
                                    name={item.author?.fullName || item.author?.username}
                                    username={item.author?.username}
                                    date={item.date}
                                    profileId={item.author._id}
                                />
                                    {
                                        isVote &&
                                        <ItemVote item={item} isVoted={item.votedUsers && item.votedUsers.includes(user?._id)} isTimeout={isTimeout} votes={votes} setVotes={setVotes} voteMode={voteMode} disabled={disabled} />
                                    }
                            </div>
                            
                        </li>
                    )
                }
            </ul>
            {/* {
                viewChild && viewChild.itemId && 
                <Modal setShowModal={setViewChild} isFull={true}>
                    <div onKeyDown={onKeyDown} tabIndex={0}>
                    {
                        viewChild.prevId &&
                        <FcPrevious className={classes.prevBtn} onClick={() => viewItem(viewChild.prevId, viewChild.index-1)} />
                    }
                    'abc'
                    <ViewItem itemId={viewChild.itemId} />
                    {
                        isVote &&
                        <ItemVote item={viewChild} isVoted={viewChild.votedUsers && viewChild.votedUsers.includes(user._id)} isTimeout={isTimeout} votes={votes} setVotes={setVotes} voteMode={voteMode} disabled={disabled} />
                    }
                    {
                        viewChild.nextId &&
                        <FcNext className={classes.nextBtn} onClick={() => viewItem(viewChild.nextId, viewChild.index+1)}  />
                    }
                    </div>
                </Modal>
            } */}
        </>
        
    )
}

export default ItemCollection;