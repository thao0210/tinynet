import { useState } from 'react';
import { useStore } from '@/store/useStore';
import classes from './styles.module.scss';
import { FaHeart, FaEye } from "react-icons/fa";
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { IoChatboxEllipses } from "react-icons/io5";
import classNames from 'classnames';
import Tippy from '@tippyjs/react';

export const LikeIcon = ({item, isComment}) => {
    const [isLiked, setIsLiked] = useState(item.isLiked);
    const [noOfLikes, setNoOfLikes] = useState(item.noOfLikes);
    const {user} = useStore();

    const onLikeToggle = async (e) => {
        const url = isComment ? `${urls.LIST_COMMENTS}/${item._id}/like` : `${urls.LIST}/${item._id}/like`;
        const likeToggle = await api.post(url, {});
        if (likeToggle.data) {
            setIsLiked(likeToggle.data.isLiked);
            setNoOfLikes(likeToggle.data.noOfLikes);
        }
    }
    return (
        <Tippy content={isLiked ? 'Unlike' : 'Like'}>
        <div className={classNames(classes.like, {[classes.noClick]: !user})} onClick={onLikeToggle}>
            {
                user && 
                <>
                    {noOfLikes > 0 && noOfLikes}<FaHeart size={16} />
                </>
            }
            {
                !user && noOfLikes > 0 &&
                <>
                    {noOfLikes}<FaHeart size={16} />
                </>
            }
        </div>
        </Tippy>
    )
}

export const CommentIcon = ({noOfComments, onClick}) => {
    const {user} = useStore();
    const commentOnClick = () => {
        onClick && onClick();
    }
    return (
        <Tippy content={'Comment'}>
        <div className={classNames(classes.like, classes.comment, {[classes.noClick]: !user})} onClick={commentOnClick}>
            {
                user && 
                <>
                    {noOfComments > 0 && noOfComments}<IoChatboxEllipses size={16} />
                </>
            }
            {
                !user && noOfComments > 0 &&
                <>
                    {noOfComments}<IoChatboxEllipses size={16} />
                </>
            }
        </div>
        </Tippy>
    )
}

export const ViewIcon = ({views}) => {
    return (
        <div className={classNames(classes.like, classes.comment, classes.noClick)}>
            {views}<FaEye size={16} />
        </div>
    )
}