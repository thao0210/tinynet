import classes from './styles.module.scss';
import { useStore } from '@/store/useStore';
import { BsPersonCircle } from "react-icons/bs";
import { IoLogOutSharp } from "react-icons/io5";
import api, { clearAccessToken } from '@/services/api';
import urls from '@/sharedConstants/urls';
import SearchBar from './search';
import Notifications from './notifications';
import { StarPoints } from '../Utilities';
import { useRef, useState } from 'react';
import useClickOutside from '@/hooks/useClickOutsite';
import classNames from 'classnames';
import Message from './message';
import { useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';

const Avatar = ({avatar, size, onClick}) => {
    if (avatar) {
        return <img src={avatar} alt='avatar' height={size} onClick={onClick} />
    } else {
        return <BsPersonCircle size={size} color='#666' />
    }
}

const ThumbProfile = ({user, setUser, avatar}) => {
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef();
    useClickOutside(profileRef, () => setShowProfile(false));

    const onLogout = async () => {
        const logout = await api.post(urls.LOUTOUT);
        if (logout.data) {
            setUser(null);
            clearAccessToken(); 
            localStorage.removeItem("userLoggedIn");
        }
    }

    const onProfile = () => {
        navigate('/myProfile');
    }

    return (
        <div className={classes.thumbProfile}>
            <Notifications />
            <Message />
            <Tippy content="Profile" placement="bottom">
            <div className={classes.profile} ref={profileRef}>
                <Avatar avatar={avatar} size={30} onClick={() => setShowProfile(true)} />
                {
                    showProfile &&
                    <div className={classes.details}>
                        <div className={classes.avatar} onClick={onProfile}>
                            <Avatar avatar={avatar} size={40} />
                            <div>
                                <strong>{user && user.fullName ? user.fullName : user.username}</strong><br />
                                <StarPoints points={user && user.userPoints} size={20} />
                            </div>
                        </div>
                        <div onClick={onLogout}>
                            <IoLogOutSharp size={25} /> Log Out
                        </div>
                    </div>
                }
            </div>
            </Tippy>
        </div>
    )
}
const Head = ({isDark, ...rest}) => {
    const {user, setUser, setShowModal} = useStore();
    const hasAccount = localStorage.getItem('hasAccount');

    return (
        <div className={classNames(classes.head, 'head')}>
            <img className={classes.logo} src={'/logo.svg'} alt='Logo' height={35} />
            <SearchBar {...rest}/>
            <div className={classNames(classes.login, 'login')}>
                {
                    user && user.username ?
                    <ThumbProfile user={user} setUser={setUser} avatar={user.avatar} /> :
                    <>
                        <span onClick={() => setShowModal('login')}>{hasAccount ? 'Sign In' : 'Sign Up'}</span>
                    </>
                }
            </div>
        </div>
    )
}

export default Head;