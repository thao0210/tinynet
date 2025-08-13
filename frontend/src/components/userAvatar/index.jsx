import classes from './styles.module.scss';
import { format } from "date-fns";
import { useStore } from '@/store/useStore';
import { useRef, useState } from 'react';
import api from '@/services/api';
import urls from '@/sharedConstants/urls';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../dropdown';

const UserAvatar = ({avatar, name, date, profileId, username, isAnonymous}) => {
    const {setShowModal, user, setLoading, setList, setSearchFor, setLoadList} = useStore();
    const [isFollowing, setIsFollowing] = useState(false);
    const navigate = useNavigate();

    const onViewProfile = () => {
        navigate('/profile/' + profileId);
    }

    const onViewPosts = async () => {
        navigate('/list');
        const search = await api.get(`${urls.SEARCH_ITEMS}?keyword=${username}`);
        if (search.data && search.data.results) {
            setShowModal('');
            setLoading(false);
            setList(search.data.results);
            setSearchFor(name);
        }
    }

    const checkFollowing = async () => {
        const checkfollow = await api.get(`${urls.CHECK_FOLLOW_STATUS}/${profileId}`);
        if (checkfollow.data) {
            setIsFollowing(checkfollow.data.isFollowing);
        }
    }

    const avatarOnClick = () => {
        user && user._id !== profileId && checkFollowing();
    }

    const toggleFollow = async () => {
        const toggleFollowing = await api.post(`${urls.TOGGLE_FOLLOW}`, {userId: profileId});
        if (toggleFollowing.data) {
            const f = toggleFollowing.data.isFollowing ? 'following' : 'unfollowing';
            toast.success('You are ' + f + ' ' + name + ' successfully!');
        }
    }

    const onBlock = async () => {
        try {
            const blockUser = await api.post(`${urls.BLOCK_USER}/${profileId}`);
            if (blockUser.data) {
                setLoadList(true);
                setShowModal('');
                navigate('/list');
            }
        } catch (error) {
            console.log(error);
        }
    }

    const onHidePosts = async () => {
        try {
            const hideAuthor = await api.post(`${urls.HIDE_AUTHOR}/${profileId}`);
            if (hideAuthor.data) {
                setLoadList(true);
                setShowModal('');
                navigate('/list');
            }
        } catch (error) {
            console.log(error);
        }
    }

    const trigger = !isAnonymous ? (
        <div className={classes.avatar} onClick={avatarOnClick}>
            {avatar && <img src={avatar} height={25} />}
            <div>
                {
                    name && <><strong>{name}</strong><br /></>
                }
                {
                    date && <span>{format(date, 'dd-MM-yyyy')}</span>
                }
            </div>
        </div>
        ) : (
        <div className={classes.avatar}>
            <img src="/anonymous.svg" alt="anonymous" height={28} />
        </div>
    );

    return (
    <>
        {!isAnonymous ? (
        <Dropdown
            trigger={trigger}
            width={120}
            dropdownContainerSelector="#boxes"
            stopPropagation
        >
            <div className={classes.profileMenus}>
            <ul>
                <li onClick={onViewPosts}>All Posts</li>
                {
                    user &&
                    <li onClick={onViewProfile}>Profile</li>
                }
                
            </ul>

            {user && user._id !== profileId && (
                <>
                <button onClick={toggleFollow}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button onClick={onHidePosts}>Hide all posts</button>
                <button onClick={onBlock}>Block user</button>
                </>
            )}
            </div>
        </Dropdown>
        ) : (
        trigger
        )}
    </>
    );
} 

export default UserAvatar;