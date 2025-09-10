import { useEffect, useRef, useState } from "react";
import bell from '@/assets/bell.svg';
import classes from './styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { formatDistance } from "date-fns";
import { StarPoints } from "../Utilities";
import Dropdown from '@/components/dropdown';
import { useNavigate } from "react-router-dom";
import { ItemMenus2 } from "../listComponents/itemMenus";

const Noti = ({notif, setReloadList}) => {
    const navigate = useNavigate();
    const onMarkRead = async () => {
        const setRead = await api.post(`${urls.NOTIFICATIONS}/${notif._id}/markRead`);
        if (setRead.data) {
            setReloadList(true);
        }
    }

    const onDelete = async () => {
        const deleteItem = await api.delete(`${urls.NOTIFICATIONS}/${notif._id}`);
        if (deleteItem.data) {
            setReloadList(true);
        }
    }

    const onView = () => {
        notif.post && notif.post._id && navigate('/post/'+notif.post._id);
    }

    return (
        <li className={notif.isRead ? classes.read : ''}>
            <div className={classes.avatar} onClick={() => navigate('/profile/'+notif.sender._id)}>
                <img src={notif.sender && notif.sender.avatar} height={35} />
            </div>
            <div onClick={onMarkRead}>
                {notif.type === "comment" && (
                <p>
                    <strong>{notif.sender?.fullName || notif.sender?.username}</strong> has been commented on {" "}
                    <strong>{notif.post?.title}</strong>: "{notif.comment?.text}"
                </p>
                )}
                {notif.type === "mention" && (
                <p>
                    <strong>{notif.sender?.fullName || notif.sender?.username}</strong> has mentioned you in a comment: "
                    {notif.comment?.text}"
                </p>
                )}
                {notif.type === "like" && (
                <p>
                    <strong>{notif.sender?.fullName || notif.sender?.username}</strong> has liked "
                    <strong>{notif.post?.title}</strong>"
                </p>
                )}
                {
                    notif.type === 'new_post' && (
                        <p>
                            <strong>{notif.sender?.fullName || notif.sender?.username}</strong> has created a new post 
                            <strong>{notif.post?.title}</strong>"
                        </p>
                    )
                }
                {
                    notif.type === "follow" && (
                    <p>
                        <strong>{notif.sender?.fullName || notif.sender?.username}</strong> has followed you
                    </p>
                )}
                {
                    notif.type === "sendPoints" && (
                        <p>
                            <strong>{notif.sender?.fullName || notif.sender?.username}</strong> has sent you <StarPoints points={notif.points} size={20} />!
                        </p>)
                }
                <small>{formatDistance(notif.createdAt, Date.now(), {addSuffix: true})}</small>
            </div>
            <ItemMenus2
                onDelete={onDelete}
                onView={notif.post && notif.post._id ? onView : null}
            />
        </li>
    )
}
const Notifications = () => {
    const [noOfNo, setNoOfNo] = useState(0);
    const [noList, setNoList] = useState([]);
    const [reloadList, setReloadList] = useState(false);


    const getList = async () => {
        const getNotiList = await api.get(`${urls.NOTIFICATIONS}`);
        if (getNotiList.data) {
            setNoList(getNotiList.data);
            setReloadList(false);
        }
    }

    const onNotiIconClick = async () => {
        const resetCount = await api.post(urls.NOTIFICATIONS_RESET);
        if (resetCount.data) {
            setNoOfNo(0);
            getList();
        }
    }

    useEffect(() => {
        const countNoti = async () => {
            const count = await api.get(`${urls.NOTIFICATIONS_COUNT}`);
            if (count.data) {
                setNoOfNo(count.data.count);
            }
        };
        countNoti();

        const interval = setInterval(countNoti, 60000);
        return () => clearInterval(interval);
    },[]);

    useEffect(() => {
        reloadList && getList();
    }, [reloadList]);

    return (
        <div className={classes.notifications}>
            <Dropdown
                trigger={
                    <div className={classes.icon} onClick={onNotiIconClick}>
                        <img src={bell} alt='Messages' height={28} />
                        {
                            noOfNo > 0 && <span>{noOfNo}</span>
                        }
                    </div>
                }
                width={300}
                tippy="Notifications"
            >
                <div className={classes.noList}>
                    <h3>Notifications</h3>
                    {
                        noList.length === 0 &&
                        <div className="noContent">No notifications found.</div>
                    }
                    {
                        noList.length > 0 &&
                        <ul className={classes.notiList}>
                           {noList.map((notif, index) => 
                            <Noti key={notif._id} notif={notif} setReloadList={setReloadList} />
                        )}
                        </ul>
                    }
                </div>
            </Dropdown>
        </div>
    )
}

export default Notifications;