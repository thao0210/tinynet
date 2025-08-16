import classes from './styles.module.scss';
import { useEffect, useRef, useState } from 'react';
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry";
import { useStore } from '@/store/useStore';
import api from '@/services/api';
import Head from '@/components/header';
import urls from '@/sharedConstants/urls';
import New, { CommentIcon, Filters, ItemType, LikeIcon, TopMenus } from './list-components';
import classNames from 'classnames';
import Loader from '@/components/loader';
import iconChampion from '@/assets/champion.svg';
import { useInView } from "react-intersection-observer";
import HomeBanner from '@/components/banner/homeBanner';
import { useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import { CountdownDateTime } from "@/components/countdown";
import useClickOutside from '@/hooks/useClickOutsite';
import { BsGlobe2, BsThreeDots } from 'react-icons/bs';
import { getTitleByLang } from '@/utils/lang';
import ReactDOM from 'react-dom';

const Item = ({item, setShowModal, className}) => {
    const {user} = useStore();
    const navigate = useNavigate();
    const myPost = item?.author && item?.author?.username && (user?.username === item?.author?.username);
    const onItemClick = async () => {
        if (item.hasPass) {
            let hint = '';
            if (item.passwordHint) {
                hint = item.passwordHint;
            }
            setShowModal(`itemPassword-${item._id}-${hint}`);
        } else if(item.sendOtp) {
            //api sendOtp
            const sendOtp = await api.post(urls.ITEM_SEND_OTP, {email: user.email});
            if (sendOtp.data) {
                setShowModal('itemOtp-'+item._id);
            }
        } else {
            navigate('/post/' + (item.slug || item._id));
        }
    }

    return (
        <Tippy content={`Recommended ${item.type}`} disabled={!item.isCurrentlyPromoted}>
        <div className={classNames(classes.item, className, item.type, {[classes.locked]: item.hasPass || item.sendOtp, [classes.promoted]: item.isCurrentlyPromoted})}>
            {
                item.type === 'vote' &&
                <div className={classes.alert}>
                    {
                        item.deadline && user && user.timezone &&
                        <CountdownDateTime deadline={item.deadline} userTimezone={user.timezone} />
                    }
                </div>
            }
            <div onClick={onItemClick}>
                {
                    item.showTitle &&
                    <h3>{item?.translations?.length > 0 ? getTitleByLang(item, navigator.language) : item.title} {item.type === 'collection' && item.items && item.items.length ? <sup>{item.items.length}</sup>: ''}
                    </h3>                                                                                                                                
                }
                <ItemType item={item} />
            </div>
            {
                item.language && item.translations?.length > 0 &&
                <Tippy content='Available in multi languages'>
                <span className={classNames(classes.multiLanguages, 'multiLanguages')}>
                    <BsGlobe2 />
                </span>
                </Tippy>
            }
            <div className={classes.infos}>
                {
                    (user) &&
                    <TopMenus item={item} isMyPost={myPost} isUser={user} showUser={true} />
                }
            </div>
        </div>
        </Tippy>
    )
}
const Home = () => {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchPage, setSearchPage] = useState(1);
    const [searchHasMore, setSearchHasMore] = useState(true);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const { ref, inView } = useInView({ triggerOnce: false });
    const {user, setShowModal, setLoadList, list, setList, loadList, setLoading, loading, searchFor, setSearchFor, curTheme} = useStore();
    const [showIntro, setShowIntro] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [filters, setFilters] = useState({
        sortBy: 'latest',
    });
    const [showFilters, setShowFilters] = useState(false);
    const infoRef = useRef();
    useClickOutside(infoRef, () => setShowInfo(false));

    const callListItem = async (pageNum) => {
        if (pageNum === 1) {
            setLoading(true); // chỉ loading mạnh khi load mới
        }
        try {
            const filtersString = Object.entries(filters)
                .filter(([key, value]) => !['sortBy', 'from', 'to'].includes(key) && value === true)
                .map(([key]) => key)
                .join(',');
            const getListItems = await api.get(`${urls.LIST}?page=${pageNum}&type=${filters?.type}&sortBy=${filters?.sortBy}&from=${filters?.fromDate}&to=${filters?.toDate}&filters=${filtersString}&userId=${user?._id}`);
            if (getListItems.data) {
                if (getListItems.data.length === 0) {
                    setHasMore(false);
                }
                if (pageNum === 1) {
                    setList(getListItems.data); // nếu là page 1: reset list
                } else {
                    setList(prev => [...prev, ...getListItems.data]); // nếu là page 2++: cộng thêm
                }
                setLoadList(false);
            }
        } catch (error) {
            setLoadList(false);
        } finally {
            setLoading(false); // chỉ khi kết thúc, mới set loading false
        }
    }

    const callSearchItem = async (pageNum, keyword) => {
        if (pageNum === 1) {
            setLoading(true);
        }
        try {
            const res = await api.get(`${urls.SEARCH_ITEMS}?page=${pageNum}&keyword=${encodeURIComponent(keyword)}${user && user._id ? '&userId=' + user._id : ''}`);
            if (res.data && res.data.results) {
                if (res.data.results.length === 0) {
                    setSearchHasMore(false);
                } else {
                    if (pageNum === 1) {
                        setList(res.data.results);
                    } else {
                        setList(prev => [...prev, ...res.data.results]);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const clearSearch = () => {
        callListItem(1);
        setSearchFor('');
    }

    const onBannerClose = () => {
        localStorage.setItem('viewedIntroduction', true);
        setShowIntro(false);
    }

    useEffect(() => {
        if (loadList) {
            setPage(1);  // reset page về 1
            setHasMore(true); // reset hasMore luôn
            callListItem(1); // gọi lại page 1
        }
    }, [loadList]);

    useEffect(() => {
        if (inView && !loading) {
            if (searchFor) {
                if (searchHasMore) {
                    callSearchItem(searchPage, searchFor);
                    setSearchPage(prev => prev + 1);
                }
            } else {
                if (hasMore) {
                    callListItem(page);
                    setPage(prev => prev + 1);
                }
            }
        }
    }, [inView, hasMore, searchHasMore, loading, searchFor]);

    useEffect(()=>{
        callListItem(1);
    }, [filters]);
    useEffect(() => {
        const viewedIntroduction = localStorage.getItem('viewedIntroduction');
        if (viewedIntroduction) {
            setShowIntro(false);
        } else {
            if (window.innerWidth >= 600) { // chỉ show intro trên desktop
            setShowIntro(true);
            }
        }
    }, []);

    return (
        <div id={classes.home}>
            <Head 
                setList={setList} 
                setHasMore={setHasMore}
                setPage={setPage}
                setSearchPage={setSearchPage}
                setSearchHasMore={setSearchHasMore}
                callSearchItem={callSearchItem}
                isDark={isDarkTheme}
            />
            <div className={classNames(classes.list, curTheme)}>
                {
                    searchFor &&
                    <div className={classNames(classes.searchTitle, 'searchTitle')}>
                        Search results for <strong>
                            {searchFor} <span onClick={clearSearch}>&times;</span>
                        </strong>
                    </div>
                }
                <ResponsiveMasonry
                    columnsCountBreakPoints={{350: 1, 600: 2, 900: 3, 1100: 4, 1300: 5}}
                    gutterBreakpoints={{350: "12px", 600: "16px", 900: "24px"}}
                    className='mansory'
                >
                    <Masonry>
                        {
                            list && list.length > 0 && !loading &&
                            list.map((item, index) => 
                                <Item 
                                    key={`item${index}`}
                                    item={item} 
                                    setShowModal={setShowModal}
                                    className={`item${index%12}`}
                                />
                            )
                        }
                    </Masonry>
                </ResponsiveMasonry>
                {
                    loading &&
                    <Loader />
                }
                {
                    list.length === 0 && !loading &&
                    <div className={classes.noItem}>No item found.</div>
                }
                {hasMore && <div ref={ref} style={{ height: 20 }} />}
            </div>
            {
                list && list.length > 0 &&
                <Filters 
                    setFilters={setFilters} 
                    setShowFilters={setShowFilters} 
                    showFilters={showFilters} 
                    filters={filters}
                    setIsDarkTheme={setIsDarkTheme}
                />
            }
            
            <div className={classes.bMenusLeft} ref={infoRef}>
                <Tippy content='Website Information'>
                    <img src='/info.svg' alt='info' height={30} onClick={() => setShowInfo(true)} />
                </Tippy>
                {
                    showInfo &&
                    <div>
                        © 2025
                        <span onClick={() => setShowModal('terms')}>Terms and Privacty</span>
                        <span onClick={() => setShowModal('aboutUs')}>About</span>
                        <span onClick={() => setShowModal('contactUs')}>Contact</span>
                        <span onClick={() => setShowModal('donateMethod')}>Support</span>                            
                    </div>
                }
            </div>
            
            {
                user && user.username &&
                ReactDOM.createPortal(
                    <div className={classNames(classes.bMenus, 'bMenus')}>
                        <New />
                        <Tippy content='Weekly Champions'>
                            <img src={iconChampion} alt='Chaampion' title='Chanpion Board' className={classes.championView} onClick={() => setShowModal('champions')} />
                        </Tippy>
                        <Tippy content='Mini Games'>
                            <img src={'/game.svg'} alt='Games' title='Mini Games' className={classes.championView} onClick={() => setShowModal('games')} />
                        </Tippy>
                    </div>, document.getElementById('boxes')
                )
            }
            {
                showIntro &&
                <HomeBanner onClose={onBannerClose}/>
            }
        </div>
    )
}

export default Home;