import classes from './styles.module.scss';
import { MdEdit } from 'react-icons/md';
import { useEffect, useState } from 'react';
import ChangePassword from './changePass';
import { useStore } from '@/store/useStore';
import GeneralInformation from './generalInfo';
import EditAvatar from './editAvatar';
import api from '@/services/api';
import urls from "@/sharedConstants/urls";
import toast from 'react-hot-toast';
import { StarPoints } from '@/components/Utilities';
import PointsHistory, { MedalRules } from '../points';
import Modal from '@/components/modal';
import Tippy from '@tippyjs/react';
import PaymentDetails from './paymentDetails';
import { medalUrl, profileMenuItems, PointsMenu } from '@/sharedConstants/data';
import SupportModal from './supportModal';
import BlockHide from './blockHide';
import ReportsPage from './report';
import { useNavigate, useParams } from 'react-router-dom';
import { BsGridFill } from 'react-icons/bs';

const Profile = () => {
    const {user, showModal} = useStore();
    const [menu, setMenu] = useState('general');
    const { userId: routeUserId } = useParams();
    const [imageFile, setImageFile] = useState('');
    const baseUrl = import.meta.env.VITE_R2_BASE_URL;
    const tempAvatar = baseUrl + '/avatar/1.webp';
    const [userInfo, setUserInfo] = useState({});
    const [isFollowing, setIsFollowing] = useState(false);
    const [showMedalRule, setShowMedalRule] = useState(false);
    const [viewSupport, setViewSupport] = useState(false);
    const [payments, setPayments] = useState([{ type: 'paypal', value: '' }]);
    const [note, setNote] = useState('');
    const [showPointsMenu, setShowPointsMenu] = useState(false);
    const [starsType, setStarsType] = useState('');
    const navigate = useNavigate();
    const effectiveUserId =
        routeUserId || (showModal.includes('-') ? showModal.split('-')[1] : user?._id);
    const isMyProfile = user && user._id === userInfo._id;

    const toggleFollow = async () => {
        const toggleFollowing = await api.post(`${urls.TOGGLE_FOLLOW}`, {userId: userInfo._id});
        if (toggleFollowing.data) {
            const f = toggleFollowing.data.isFollowing ? 'following' : 'unfollowing';
            toast.success('You are ' + f + ' ' + name + ' successfully!');
            setIsFollowing(toggleFollowing.data.isFollowing);
        }
    }

    useEffect(() => {
        if (user) {
            if (user.avatar) {
                setImageFile(user.avatar + '?v=' + (user.avatarDate || Date.now()));
            } else {
                setImageFile(tempAvatar);
            }
        }

        const getUserInfo = async () => {
            const getInfo = await api.get(`${urls.USER_INFO}?userId=${effectiveUserId}`);
            if (getInfo.data && getInfo.data.user) {
                setUserInfo(getInfo.data.user);
                setImageFile(getInfo.data.user.avatar + '?v=' + (getInfo.data.user.avatarDate || Date.now()) );
                setIsFollowing(getInfo.data.isFollowing);
                if (getInfo.data.user.supportMethods?.length > 0) {
                    setPayments(getInfo.data.user.supportMethods);
                }
        
                if (getInfo.data.user.supportNote) {
                    setNote(getInfo.data.user.supportNote);
                }
            }
        }
        getUserInfo();

    }, [user, showModal]);

    return (
        <div className={classes.profile} id='profile'>
            {routeUserId && (
                <Tippy content="Back to list">
                    <span className={classes.viewList} onClick={() => navigate('/list')}>
                        <BsGridFill />
                    </span>
                </Tippy>
            )}
            <div className={classes.left}>
                <div className={classes.avatar}>
                    <span className={!imageFile.includes('webp') ? classes.hideOver : ''}>
                        <img src={imageFile} width={150} />
                    </span>
                    {
                        isMyProfile &&
                        <MdEdit className={classes.edit} onClick={() => setMenu('edit-avatar')} title='Change Avatar' />
                    }
                    <div className={classes.userRank} onClick={() => setShowMedalRule(true)}>
                        <Tippy content='View Medals Rule'>
                        <img src={medalUrl(userInfo.userRank)} height={100} />
                        </Tippy>
                    </div>
                </div>
                <div className={classes.rank} onMouseOver={() => setShowPointsMenu(true)} onMouseOut={() => setShowPointsMenu(false)}>
                    <div className={classes.stars}>
                        <StarPoints points={userInfo.userPoints} size={30} />
                    </div>
                    {
                        showPointsMenu &&
                        <ul className={classes.pointsMenu}>
                            {
                                PointsMenu.map((point, index) => (
                                    <li key={`points${index}`} onClick={() => setStarsType(point)}>
                                        {point}
                                    </li>
                                ))
                            }                            
                            {
                                isMyProfile &&
                                <>
                                    <li onClick={() => setStarsType('Stars History')}>Stars History</li>
                                    <li onClick={() => setStarsType('Buy more Stars')}>Buy more Stars</li>
                                </>
                            }
                        </ul>
                    }
                </div>
                
                {
                    !isMyProfile && userInfo.noOfPosts > 0 &&
                    <>
                    <div className={classes.follow}>
                        <button className="btn" onClick={toggleFollow}>
                            {
                                isFollowing ? 'Unfollow' : 'Follow'
                            }
                        </button>
                    </div>
                    {
                        userInfo.supportMethods &&
                        <div className={classes.follow}>
                            <button  onClick={() => setViewSupport(true)} className='btn main2'>
                                Support Author
                            </button>
                        </div> 
                    }
                     
                    </>
                }
                    
            </div>
            <div className={classes.body}>
                {
                    isMyProfile &&
                    <ul className={classes.menus}>
                        {profileMenuItems.map(item => (
                            <li
                            key={item.key}
                            className={menu === item.key ? classes.active : ''}
                            onClick={() => setMenu(item.key)}
                            >
                            {item.label}
                            </li>
                        ))}
                    </ul>
                }
                <div className={classes.content}>
                    {
                        menu === 'change-password' &&
                        <ChangePassword />
                    }
                    {
                        menu === 'general' && userInfo &&
                        <GeneralInformation userInfo={userInfo} isMyProfile={isMyProfile} setUserInfo={setUserInfo} />
                    }
                    {
                        menu === 'edit-avatar' &&
                        <EditAvatar />
                    }
                    {
                        menu === 'support' &&
                        <PaymentDetails payments={payments} setPayments={setPayments} note={note} setNote={setNote} setViewSupport={setViewSupport}/>
                    }
                    {
                        menu === 'hideblock' &&
                        <BlockHide />
                    }
                    {
                        menu === 'reports' &&
                        <ReportsPage user={user} />
                    }
                </div>
            </div>
            {
                starsType &&
                <Modal setShowModal={setStarsType} width={800}>
                    <PointsHistory isUser={isMyProfile}  type={starsType} userInfo={userInfo}/>
                </Modal>
            }
            {
                showMedalRule &&
                <Modal setShowModal={setShowMedalRule} width={600}>
                    <MedalRules />
                </Modal>
            }
            {
                viewSupport &&
                <SupportModal userInfo={userInfo} note={note} payments={payments} imageFile={imageFile} setShowModal={setViewSupport} />
            }
        </div>
    )
}

export default Profile;