import { useState } from 'react';
import { useStore } from '@/store/useStore';
import classes from './styles.module.scss';
import { FaHeart, FaEye } from "react-icons/fa";
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { IoChatboxEllipses } from "react-icons/io5";
import classNames from 'classnames';
import Tippy from '@tippyjs/react';
import { formatNumber } from '@/utils/numbers';

const ActionIcon = ({ tooltip, count, icon, onClick, disabled }) => {
  return (
    <Tippy content={tooltip}>
      <div
        className={classNames(classes.action, { [classes.noClick]: disabled })}
        onClick={disabled ? undefined : onClick}
      >
        {count > 0 && <span>{formatNumber(count)}</span>}
        {icon}
      </div>
    </Tippy>
  );
};

export const LikeIcon = ({ item, isComment }) => {
  const [isLiked, setIsLiked] = useState(item?.isLiked || false);
  const [noOfLikes, setNoOfLikes] = useState(item?.noOfLikes || 0);
  const { user } = useStore();

  const onLikeToggle = async () => {
    const url = isComment
      ? `${urls.LIST_COMMENTS}/${item._id}/like`
      : `${urls.LIST}/${item._id}/like`;
    const res = await api.post(url, {});
    if (res.data) {
      setIsLiked(res.data.isLiked);
      setNoOfLikes(res.data.noOfLikes);
    }
  };

  return (
    <ActionIcon
      tooltip={isLiked ? "Unlike" : "Like"}
      count={noOfLikes}
      icon={<FaHeart size={16} />}
      onClick={onLikeToggle}
      disabled={!user}
    />
  );
};

export const CommentIcon = ({ noOfComments, onClick }) => {
  const { user } = useStore();
  return (
    <ActionIcon
      tooltip="Comment"
      count={noOfComments}
      icon={<IoChatboxEllipses size={16} />}
      onClick={onClick}
      disabled={!user}
    />
  );
};

export const ViewIcon = ({views}) => {
    return (
        <div className={classNames(classes.like, classes.comment, classes.noClick)}>
            {formatNumber(views)}<FaEye size={16} />
        </div>
    )
}