import {motion} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import classes from './styles.module.scss';
import ItemMenus from '@/components/itemMenu';
import { FaHeart, FaEye } from "react-icons/fa";
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { IoChatboxEllipses } from "react-icons/io5";
import classNames from 'classnames';
import toast from 'react-hot-toast';
import { VerifyOtp } from '../login/register';
import useClickOutside from '@/hooks/useClickOutsite';
import { BiSolidUpvote } from 'react-icons/bi';
import Dropdown from '@/components/dropdown';
import DateTimePicker from '@/components/timepicker';
import Checkbox from '@/components/checkbox';
import { useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import { LoadingDots } from '@/components/loader';
import { getActiveContent } from '@/utils/lang';
import ReactDOM from 'react-dom';
import {ITEM_TYPE, SORT_BY} from '@/sharedConstants/data';

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
                item.type === 'vote'  && item.items?.length > 0 &&
                <div className={classes.collectionItemsVote}>
                    {
                        item.items.map((it, index) => <BiSolidUpvote color='#d411d4' size={28} key={`vote${index}`} />)
                    }
                </div>
            }
            { item.type === 'draco' && item.imageUrl &&
                <img src={item.imageUrl} alt={item.type} />
            }
            {
                item.type === 'shareUrl' && item.preview && item.url &&
                <>
                {
                    metaData && metaData.image &&
                    <img src={metaData.image} alt={item.type} />
                }
                <div>
                <a href={item.url} target='_blank'>View shared url directly</a>
                </div>
                </>
                
            }
            {
                item.type === 'card' && item.thumbnailImage &&
                <img src={item.thumbnailImage} alt={item.type} />
            }
            {
                (item.hasPass || item.sendOtp) &&
                <svg width="60px" height="60px" viewBox="-10 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs></defs><path fill='currentColor' className="cls-1" d="M644,356h32a4,4,0,0,1,4,4v26a4,4,0,0,1-4,4H644a4,4,0,0,1-4-4V360A4,4,0,0,1,644,356Zm18,17.445V378a2,2,0,0,1-4,0v-4.555A4,4,0,1,1,662,373.445ZM670,352v-6a10,10,0,0,0-20,0v6h-6v-6a16,16,0,0,1,32,0v6h-6Z" id="lock" transform="translate(-640 -330)"/></svg>
            }
        </div>
    )
}
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

export const TopMenus = ({item, isView, isMyPost, isUser, noDots, showUser}) => {
    const {setLoadList, setCurItemId, setShowModal} = useStore();
    const navigate = useNavigate();

    const onEdit = (e) => {
        e.stopPropagation();
        setCurItemId(item._id);
        setShowModal('newItem');
    }

    const onDelete = async (e) => {
        e.stopPropagation();
        const confirm = window.confirm('Do you want to remove this?');
        if (confirm) {
            const deleteComment = await api.delete(`${urls.LIST}/${item._id}`);
            if (deleteComment.data) {
                isView && setShowModal('');
                setLoadList(true);
                navigate('/list');
            }
        }
    }

    const onReport = (e) => {
        e.stopPropagation();
        setShowModal('report-item-' + item._id);
    }

    const onHideItem = async (e) => {
        e.stopPropagation();
        try {
            const hideItem = await api.post(`${urls.HIDE_ITEM}/${item._id}`);
            if (hideItem.data) {
                setLoadList(true);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <ItemMenus
            item={item}
            onDelete={onDelete}
            onEdit={onEdit}
            onReport={onReport}
            isMyPost={isMyPost}
            onHideItem={onHideItem}
            isUser={isUser}
            noDots={noDots}
            showUser={showUser}
        />
    )
}

export const InputPassword = () => {
    const {showModal, setShowModal, user, setLoadViewContent} = useStore();
    const [password, setPassword] = useState('');
    const [sendingOTP, setSendOTP] = useState(false);
    const [hint, setHint] = useState('');
    const [itemId, setItemId] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        const arr = showModal.split('-');
        if (arr.length > 1){
            setItemId(arr[1]);
            const _hint = arr.length > 2 ? arr[2] : '';
            _hint && setHint(_hint);
        }
    }, []);
    
    const onSave = async () => {
        const checkPassApi = await api.post(`${urls.LIST}/${itemId}/check-password`, {
            itemId,
            password
        });
        if (checkPassApi.data) {
            if (checkPassApi.data.requiresOtp) {
                if (!user) {
                    toast.error('To view this post also need OTP.');
                    toast.error('Please login to receive the OTP then try again!');
                    setShowModal('login');
                    return;
                }
                setSendOTP(true);
                const sendOtp = await api.post(`api/send-otp`, {email: user.email});
                if (sendOtp.data) {
                    setSendOTP(false);
                    toast.success('Please check your email to input OTP');
                    setShowModal('itemOtp-'+itemId);
                }
            } else {
                const path = window.location.pathname;
                setShowModal(null);
                if (path.includes('post')) {
                    setLoadViewContent(true);
                } else {
                    navigate('/post/'+itemId);
                }
            }
        }
    }

    return (
        <div className={classes.addPassword}>
            <label>Post's password</label>
            <input type='password' autoComplete='new-password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} />
            {
                hint &&
                <div className={classes.hint}>
                    <span onClick={() => setShowHint(!showHint)}>{showHint ? 'Hide ': 'View '}hint</span>
                    {
                        showHint &&
                        <div>{hint}</div>
                    }
                </div>
            }
            <div className='buttons'>
                <button onClick={onSave} disabled={!itemId || !password || sendingOTP} className={sendingOTP ? 'btn btn-loading' : 'btn'}>Save {sendingOTP && <LoadingDots />}</button>
                <button className='btn sub' onClick={() => setShowModal(false)}>Cancel</button>
            </div>
        </div>
    )
}

export const InputOTP = () => {
    const {showModal, setShowModal, user, setLoadViewContent} = useStore();
    const navigate = useNavigate();
    let itemId = null;
    if (showModal.split('-').length > 1){
        itemId = showModal.split('-')[1]
    }

    const onVerifySuccess = () => {
        const path = window.location.pathname;
        setShowModal(null);
        if (path.includes('post')) {
            setLoadViewContent(true);
        } else {
            navigate('/post/'+itemId);
        }
    }

    return (
        <div className={classes.addPassword}>
            <p>An email with a OTP code was just sent to <b>{user && user.email}</b>, <br /> This code is valid for 5 minutes.</p>
            {
                itemId &&
                <VerifyOtp email={user && user.email} onSuccess={onVerifySuccess} itemId={itemId} />
            }
        </div>
    )
}

export const Filters = ({setShowFilters, showFilters, setFilters, filters, setIsDarkTheme}) => {
    const {user, curTheme, setCurTheme} = useStore();
    const filterRef = useRef();
    useClickOutside(filterRef, () => setShowFilters(false));
    const onSortSelect = (value) => {
        setFilters({...filters, sortBy: value});
    }
    const onTypeSelect = (value) => {
        setFilters({...filters, type: value});
    }

    const listTheme = ['pastel', 'simple', 'contrast', 'dark'];
    const onThemeSelect = (theme) => {
        localStorage.setItem('currentTheme', theme);
        setCurTheme(theme);
        if (theme === 'dark') {
            setIsDarkTheme(true);
        } else {
            setIsDarkTheme(false);
        }
    }

    useEffect(()=>{
        const app = document.getElementById('root');
        app.className = curTheme;
        document.documentElement.className = curTheme;
    }, [curTheme]);
    return (
        <div className={classes.filters}>
            <Tippy content='Themes and Filters'>
            <img src='/filter.svg' title='filter' onClick={() => setShowFilters(true)} />
            </Tippy>
            {
                showFilters &&
                ReactDOM.createPortal(
                <div className={classes.filterOptions} id='theme-options' ref={filterRef}>
                    <h4>List Theme</h4>
                    <div className={classes.themes}>
                        <Dropdown
                            curValue={curTheme}
                            list={listTheme}
                            onSelect={onThemeSelect}
                            width={140}
                            dropdownContainerSelector='#theme-options'
                        />
                    </div>
                    <h4>Filter</h4>
                    <ul>
                        <li>
                            <div>
                            <label>Sort By</label>
                            <Dropdown
                                curValue={filters?.sortBy || 'latest'}
                                list={SORT_BY}
                                onSelect={onSortSelect}
                                width={140}
                                dropdownContainerSelector='#theme-options'
                            />
                            </div>
                        </li>
                        <li>
                            <DateTimePicker
                                value={filters?.fromDate||''}
                                onChange={setFilters}
                                label="From date"
                                field='fromDate'
                            />
                        </li>
                        <li>
                            <DateTimePicker
                                value={filters?.toDate||''}
                                onChange={setFilters}
                                label="To date"
                                field='toDate'
                            />
                        </li>
                        <li>
                            <div>
                                <label>Post type</label>
                                <Dropdown
                                    curValue={filters?.type || 'all'}
                                    list={[...ITEM_TYPE, 'all']}
                                    onSelect={onTypeSelect}
                                    width={140}
                                    dropdownContainerSelector='#theme-options'
                                />
                            </div>
                        </li>
                        {
                            user &&
                            <>
                                <li>
                                    <Checkbox
                                        label={'My Posts'} 
                                        isChecked={filters?.myPosts}
                                        data={filters}
                                        dataFieldName='myPosts'
                                        setIsChecked={setFilters} 
                                    />
                                </li>
                                <li>
                                    <Checkbox
                                        label={'My Followings Posts'} 
                                        isChecked={filters?.myFollowings}
                                        data={filters}
                                        dataFieldName='myFollowings'
                                        setIsChecked={setFilters} 
                                    />
                                </li>
                                <li>
                                    <Checkbox
                                        label={'My Followers Posts'} 
                                        isChecked={filters?.myFollowers}
                                        data={filters}
                                        dataFieldName='myFollowers'
                                        setIsChecked={setFilters} 
                                    />
                                </li>
                            </>
                        }
                        
                        <li>
                            <Checkbox
                                label={'Promoted Posts'} 
                                isChecked={filters?.promoted}
                                data={filters}
                                dataFieldName='promoted'
                                setIsChecked={setFilters} 
                            />
                        </li>
                    </ul>
                </div>, document.getElementById("boxes"))
            }
            
        </div>
    )
}
const New = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {setShowModal, setCurItemId} = useStore();
    const listRef = useRef();
    useClickOutside(listRef, () => setIsOpen(false));
    const newItem = (type) => {
        setShowModal(`newItem-${type}`);
        setCurItemId('');
    }
    return (
        <div className={classes.newItem} ref={listRef}>
            <div onClick={() => setIsOpen(!isOpen)} className={isOpen ? classes.active : ''}>
                {
                    !isOpen && <Tippy content='Create new item'><span title='Create new item'>+</span></Tippy>
                }
                {
                    isOpen && <span className={classes.newBtn}>+</span>
                }
                {isOpen && (
                    <ul className={classes.typeslist}>
                    {
                        ITEM_TYPE.map((item, index) => {
                            const totalButtons = ITEM_TYPE.length;
                            const angle = (-Math.PI / 2.2) + (index / (totalButtons - 1)) * (Math.PI / 1.1);
                            const outerRadius = 120;
                            const innerRadius = 80;
                            const xOuter = Math.cos(angle) * outerRadius;
                            const yOuter = Math.sin(angle) * outerRadius;
                            const xInner = Math.cos(angle) * innerRadius;
                            const yInner = Math.sin(angle) * innerRadius;
                            const x = (xOuter + xInner) / 2;
                            const y = (yOuter + yInner) / 2;
                            return (
                                <motion.li
                                    key={index}
                                    initial={{ x: 0, y: 0, opacity: 0 }}
                                    animate={{ x: -x, y: -y, opacity: 1 }}
                                    exit={{ x: 0, y: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    onClick={() => {newItem(item); setIsOpen(false)}}
                                >
                                    <div style={{ transform: `rotate(${angle}rad) translate(0, -10px)` }}>
                                        {item}
                                    </div>
                                </motion.li>
                            )
                        })
                    }
                    </ul>
                )}
            </div>
        </div>
    )
}

export default New;