import classes from './styles.module.scss';
import classNames from 'classnames';
import { BiSolidUpvote } from 'react-icons/bi';
import { getActiveContent } from '@/utils/lang';

export const ItemType = ({item}) => {
    const metaData = item?.preview ? JSON.parse(item.preview) : null;;
    return (
        <div className={(item.hasPass || item.sendOtp) ? classNames(classes.locked, 'locked') : (['draco', 'card', 'shareUrl'].includes(item.type)) ? classes.image : ''}>
            {item.type === 'story' && item.text && item.text.length > 100 ? 
                getActiveContent(navigator.language, item)?.text.substring(0, 100) + '...' : getActiveContent(navigator.language, item)?.text}
            {item.type === 'collection' && item.items && item.items.length > 0 &&
                <ul className={classes.collectionItems}>
                    {
                        item.items.map((it, index) => <li key={`item${index}`}></li>)
                    }
                </ul>
            }
            {
                item.type === 'vote' && item.items?.length > 0 &&
                <div className={classes.collectionItemsVote}>
                    {
                        item.items.map((it, index) => <BiSolidUpvote color='#d411d4' size={28} key={`vote${index}`} />)
                    }
                </div>
            }
            { item.type === 'draco' && item.imageUrl &&
                <img className={classes.image} src={item.imageUrl} alt={item.type} />
            }
            {
                item.type === 'shareUrl' && item.preview && item.url &&
                <div>
                {
                    metaData && metaData.image &&
                    <>
                    <img className={classes.image} src={metaData.image} alt={item.type} /><br/>
                    {
                        ['facebook', 'youtube', 'instagram', 'tiktok'].includes(metaData.source) && metaData.title && metaData.title!== 'Error'?
                        <img className={classes[metaData.source]} src={`/${metaData.source}.svg`} height={20} />:
                        <span className={classes.source}>{`Source: ${metaData.source}`}</span>
                    }
                    <h4>
                        {metaData.title && metaData.title!== 'Error' ? metaData.title : ''}</h4>
                    </>
                }
                </div>                
            }
            {
                item.type === 'card' && item.thumbnailImage &&
                <img className={classes.image} src={item.thumbnailImage} alt={item.type} />
            }
            {
                (item.hasPass || item.sendOtp) &&
                <svg width="60px" height="60px" viewBox="-10 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs></defs><path fill='currentColor' className="cls-1" d="M644,356h32a4,4,0,0,1,4,4v26a4,4,0,0,1-4,4H644a4,4,0,0,1-4-4V360A4,4,0,0,1,644,356Zm18,17.445V378a2,2,0,0,1-4,0v-4.555A4,4,0,1,1,662,373.445ZM670,352v-6a10,10,0,0,0-20,0v6h-6v-6a16,16,0,0,1,32,0v6h-6Z" id="lock" transform="translate(-640 -330)"/></svg>
            }
        </div>
    )
}