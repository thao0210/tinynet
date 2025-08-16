import { useEffect, useState } from 'react';
import classes from './styles.module.scss';
import Modal from '@/components/modal';
import ViewItem from '.';
import { useStore } from '@/store/useStore';
import { FcPrevious, FcNext } from "react-icons/fc";
import UserAvatar from '@/components/userAvatar';
import { CommentIcon, LikeIcon, TopMenus } from '../list-components';
import ItemVote, { VoteResults } from './itemVote';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';
import themeClasses from './themes.module.scss';
import classNames from 'classnames';

const ItemCollection = ({colItems, isVote, id, showResults, setShowResults, isTimeout, authorId, voteMode, alreadyVoted}) => {
    const {user, setShowModal, curTheme} = useStore();
    const [viewChild, setViewChild] = useState(null);
    const [votes, setVotes] = useState([]);
    const [disabled, setDisabled] = useState(false);

    const onItemClick = async (item, index) => {
        setViewChild({
            itemId: item._id,
            index: index,
            nextId: colItems.length > index+1 ? colItems[index+1]._id : null,
            prevId: index - 1 >= 0 ? colItems[index-1]._id : null
        })
    }

    const viewItem = (itemId, index) => {
        setViewChild({
            itemId: itemId,
            index: index,
            nextId: colItems.length > index+1 ? colItems[index+1]._id : null,
            prevId: index - 1 >= 0 ? colItems[index-1]._id : null,
        })
    }

    const onKeyDown = (e) => {
        if (e.keyCode === 37 && viewChild && viewChild.prevId) {
            viewItem(viewChild.prevId, viewChild.index-1)
        }

        if (e.keyCode === 39 && viewChild &&  viewChild.nextId) {
            viewItem(viewChild.nextId, viewChild.index+1)
        }
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
                            <h3 onClick={() => onItemClick(item, index)}>{item.title}</h3>
                            <div onClick={() => onItemClick(item, index)} className={themeClasses.body}>
                                {item.type === 'story' && item.text && item.text.substring(0, 100)}
                                {item.type === 'collection' && item.items && item.items.length > 0 &&
                                    <ul className={themeClasses.collectionItems}>
                                        {
                                            item.items.map((it, index) => <li key={`item${index}`}></li>)
                                        }
                                    </ul>
                                }
                                {item.type === 'draco' && item.imageUrl &&
                                    <img src={item.imageUrl} alt='draco' />
                                }
                                {
                                    item.type === 'shareUrl' && item.preview && item.url &&
                                    <a href={item.url} target='_blank'>Share Link</a>
                                }
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
                                        !isVote && <LikeIcon item={item} />
                                    }
                                    
                                    {
                                        item.noOfComments > 0 && !isVote &&
                                        <CommentIcon noOfComments={item.noOfComments}/>
                                    }
                                    {
                                        (user && item && item.author && item.author.username && (user.username === item.author.username)) && !isVote &&
                                        <TopMenus item={item} />
                                    }
                                    {
                                        isVote &&
                                        <ItemVote item={item} isVoted={item.votedUsers && item.votedUsers.includes(user?._id)} isTimeout={isTimeout} votes={votes} setVotes={setVotes} voteMode={voteMode} disabled={disabled} />
                                    }
                            </div>
                            
                        </li>
                    )
                }
            </ul>
            {
                viewChild && viewChild.itemId && 
                <Modal setShowModal={setViewChild} isFull={true}>
                    <div onKeyDown={onKeyDown} tabIndex={0}>
                    {
                        viewChild.prevId &&
                        <FcPrevious className={classes.prevBtn} onClick={() => viewItem(viewChild.prevId, viewChild.index-1)} />
                    }
                    
                    <ViewItem itemId={viewChild.itemId} />
                    {
                        isVote &&
                        <ItemVote item={viewChild} isVoted={viewChild.votedUsers && viewChild.votedUsers.include(user._id)} isTimeout={isTimeout} votes={votes} setVotes={setVotes} voteMode={voteMode} disabled={disabled} />
                    }
                    {
                        viewChild.nextId &&
                        <FcNext className={classes.nextBtn} onClick={() => viewItem(viewChild.nextId, viewChild.index+1)}  />
                    }
                    </div>
                </Modal>
            }
        </>
        
    )
}

export default ItemCollection;