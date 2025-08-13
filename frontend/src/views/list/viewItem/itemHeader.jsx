// ViewItem/ItemHeader.jsx
import UserAvatar from '@/components/userAvatar';
import { ViewIcon, CommentIcon, LikeIcon, TopMenus } from '../list-components';
import { BsGridFill } from 'react-icons/bs';
import Tippy from '@tippyjs/react';
import themeClasses from './themes.module.scss';
import classNames from 'classnames';

const ItemHeader = ({ item, user, views, onCommentClick, navigate, isModal }) => {
    return (
        <div className={classNames(themeClasses.infos, 'infos')}>
            {item.author && (
                <UserAvatar
                    avatar={item.author.avatar || ''}
                    name={item.author?.fullName || item.author?.username}
                    date={item.date}
                    profileId={item.author._id}
                    isAnonymous={item.isAnonymous}
                />
            )}
            {views > 0 && <ViewIcon views={views} />}
            <CommentIcon noOfComments={item.noOfComments} onClick={onCommentClick} />
            <LikeIcon item={item} />
            <TopMenus
                item={item}
                isView
                isMyPost={user?.username === item?.author?.username}
                isUser={user}
            />
            {isModal && (
                <Tippy content="Back to list">
                    <span className={themeClasses.viewList} onClick={() => navigate('/list')}>
                        <BsGridFill />
                    </span>
                </Tippy>
            )}
        </div>
    );
};

export default ItemHeader;
