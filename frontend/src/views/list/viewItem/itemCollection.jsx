import { useStore } from '@/store/useStore';
import UserAvatar from '@/components/userAvatar';
import ItemVote, { VoteResults } from './itemVote';
import themeClasses from './themes.module.scss';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { ItemType } from '@/components/listComponents/itemType';
import { getTitleByLang } from '@/utils/lang';
import { useVote } from '@/contexts/voteContext';

const ItemCollection = ({colItems, isVote, id, showResults, authorId}) => {
    const {user, setShowModal, curTheme, setAllIds} = useStore();
    const { votes, disabled, callVote } = useVote();
    const navigate = useNavigate();

    const onItemClick = (item) => {
        setAllIds(colItems.map(item => item._id));
        navigate(`/post/${id}/${item._id}`
        );
    }

    const confirmVote = () => {
        if (!user) {
        setShowModal("login");
        return;
        }
        callVote(user, id, votes);
    };

    return (
        <>
            {
                isVote && votes.length > 0 && !showResults &&
                <div className={themeClasses.confirmVote}>
                    Chosen {votes.length} item{votes.length > 1 ? 's' : ''}: <strong>{votes.map(el => el.name).join(', ')}</strong>. <button className="btn" onClick={confirmVote}>Vote {votes.length > 1 ? 'these' : 'this'} item{votes.length > 1 ? 's' : ''}</button> 
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
                                        <ItemVote item={item} />
                                    }
                            </div>
                            
                        </li>
                    )
                }
            </ul>
        </>
        
    )
}

export default ItemCollection;