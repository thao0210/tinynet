import classes from './styles.module.scss';
import { MdEdit, MdReport, MdDelete, MdRemoveRedEye, MdVisibilityOff, MdOutlineReport } from "react-icons/md";
import { BsThreeDots, BsThreeDotsVertical } from "react-icons/bs";
import Tippy from '@tippyjs/react';
import useClickOutside from '@/hooks/useClickOutsite';
import { useState, useRef } from 'react';
import UserAvatar from '@/components/userAvatar';

const ItemMenus = ({onEdit, onDelete, isMyPost, onHideItem, onReport, isUser, noDots, showUser, item}) => {
    const [openMenus, setOpenMenus] = useState(false);
    const menuRef = useRef();
    useClickOutside(menuRef, () => setOpenMenus(false));

    return (
        <div className={classes.menus} onClick={() => setOpenMenus(true)} ref={menuRef}>
            {
                !noDots && isUser && <BsThreeDots />
            }
            {
                (openMenus || noDots) &&
                <div className={noDots ? classes.noDots : ''}>
                    {/* {
                        showUser &&
                        <UserAvatar
                            avatar={item.author?.avatar || ''}
                            name={item.author?.fullName || item.author?.name}
                            username={null}
                            date={item.date}
                            profileId={item.author?._id}
                            isAnonymous={item.isAnonymous}
                        />
                    } */}
                    {
                        isMyPost &&
                        <>
                            <Tippy content='Edit'>
                                <span>
                                    <MdEdit onClick={onEdit} />
                                </span>
                            </Tippy>
                            <Tippy content='Delete'>
                                <span>
                                    <MdDelete onClick={onDelete} />
                                </span>
                            </Tippy>
                        </>
                    }
                    {
                        !isMyPost && isUser &&
                        <>
                            <Tippy content='Hide'>
                                <span>
                                    <MdVisibilityOff onClick={onHideItem} />
                                </span>
                            </Tippy>
                            <Tippy content='Report'>
                                <span>
                                    <MdOutlineReport onClick={onReport} />
                                </span>
                            </Tippy>
                        </>
                    }
                </div>
            }
        </div>
    )
}

export const ItemMenus2 = ({onDelete, onView}) => {
    const [openMenus, setOpenMenus] = useState(false);
    return (
        <div className={classes.menus} onClick={() => setOpenMenus(true)}>
            <BsThreeDotsVertical />
            {
                openMenus &&
                <div>
                    {
                        onView &&
                        <MdRemoveRedEye onClick={onView} />
                    }
                    <MdDelete onClick={onDelete} />
                </div>
            }
            
        </div>
    )
}

export default ItemMenus;