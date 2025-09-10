import { useStore } from '@/store/useStore';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import classes from './styles.module.scss';
import { MdEdit, MdDelete, MdVisibilityOff, MdOutlineReport } from "react-icons/md";
import { BsThreeDots, BsThreeDotsVertical, } from "react-icons/bs";
import Tippy from '@tippyjs/react';
import useClickOutside from '@/hooks/useClickOutsite';
import { useState, useRef } from 'react';

export const ItemMenus = ({ item, isView, isMyPost, isUser, noDots, hasVote }) => {
  const { setLoadList, setCurItemId, setShowModal } = useStore();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState(false);
  const menuRef = useRef();
  useClickOutside(menuRef, () => setOpenMenus(false));

  const onEdit = (e) => {
    e.stopPropagation();
    setCurItemId(item._id);
    setShowModal("newItem");
  };

  const onDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Do you want to remove this?")) {
      const res = await api.delete(`${urls.LIST}/${item._id}`);
      if (res.data) {
        if (isView) setShowModal("");
        setLoadList(true);
        navigate("/list");
      }
    }
  };

  const onReport = (e) => {
    e.stopPropagation();
    setShowModal("report-item-" + item._id);
  };

  const onHideItem = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`${urls.HIDE_ITEM}/${item._id}`);
      if (res.data) {
        setLoadList(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const menuItems = [];
  if (isMyPost) {
    if (!hasVote) {
      menuItems.push({ icon: <MdEdit />, label: "Edit", onClick: onEdit });
    }
    menuItems.push({ icon: <MdDelete />, label: "Delete", onClick: onDelete });
  } else if (isUser) {
    menuItems.push({ icon: <MdVisibilityOff />, label: "Hide", onClick: onHideItem });
    menuItems.push({ icon: <MdOutlineReport />, label: "Report", onClick: onReport });
  }

  return (
    <div className={classes.menus} ref={menuRef} onClick={() => setOpenMenus(true)}>
      {!noDots && isUser && <BsThreeDots />}
      {(openMenus || noDots) && (
        <div className={noDots ? classes.noDots : ""}>
          {menuItems.map((menu, idx) => (
            <Tippy key={idx} content={menu.label}>
              <span onClick={menu.onClick}>{menu.icon}</span>
            </Tippy>
          ))}
        </div>
      )}
    </div>
  );
};


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