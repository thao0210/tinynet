import { useEffect, useState } from 'react';
import classes from './styles.module.scss';
import api from '@/services/api';
import urls from '@/sharedConstants/urls';
import Loader from '@/components/loader';
import classNames from 'classnames';
import { useStore } from '@/store/useStore';
import WeeklyChampionCountdown from '@/components/countdown/weeklyCountdown';
import CongratsBanner from '@/components/banner';
import {TOP_ENTRIES} from '@/sharedConstants/data.js';
import { StarPoints } from '@/components/Utilities/index.jsx';
import { useNavigate } from 'react-router-dom';

const Champions = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const {setShowModal, user} = useStore();
    const [myRank, setMyRank] = useState(0);
    const [nextReset, setNextReset] = useState(null);
    const [currentTop, setCurrentTop] = useState({
        label: 'Top Views',
        id: 'views',
        unit: 'views'
    }); 
    const [myAward, setMyAward] = useState(null);
    const [showMyAward, setShowMyAward] = useState(false);
    const [week, setWeek] = useState(1);
    const navigate = useNavigate();

    const getTopViews = async () => {
        const getTopPosts = await api.get(`${urls.CHAMPION_POSTS}?sortBy=views`);
        setResults(getTopPosts.data.posts || []);
    }

    const getNextReset = async () => {
        try {
            const getNextReset = await api.get(urls.CHAMPION_NEXTRESET);
            if (getNextReset.data) {
                setNextReset(getNextReset.data.nextReset);
                setWeek(getNextReset.data.week);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getMyResults = async () => {
        try {
            const getMyResults = await api.get(urls.CHAMPION_MYRESULTS);
            if (getMyResults.data && getMyResults.data.hasNewAward) {
                setShowMyAward(true);
                getMyResults.data.awards && setMyAward(getMyResults.data.awards);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const onCongratsClose = async () => {
        try {
            const getAwardSeen = await api.post(urls.CHAMPION_MARKSEEN);
            if (getAwardSeen.data) {
                console.log('seen all');
            }
        } catch (error) {
            console.log(error);
        }
        setShowMyAward(false);
    }

    const topTypes = [
    { id: 'post', label: 'Top Items' },
    { id: 'user', label: 'Top Users' }
    ];

    const [sortType, setSortType] = useState('post');

    const filteredList = TOP_ENTRIES.filter(item =>
    sortType === 'post' ? ['post', 'comment'].includes(item.type) : item.type === 'user'
    );

    const onSortByClick = async (item) => {
        setLoading(true);
        setCurrentTop(item);
        let res = null;

        try {
            if (item.type === 'user') {
                res = await api.get(`${urls.CHAMPION_USERS}?sortBy=${item.id}`);
                setResults(res.data.topUsers || []);
            } else if (item.type === 'comment') {
                res = await api.get(`${urls.CHAMPION_COMMENTS}`);
                setResults(res.data.topComments || []);
            } else {
                res = await api.get(`${urls.CHAMPION_POSTS}?sortBy=${item.id}`);
                setResults(res.data.posts || []);
            }

            // nếu có userRank
            if (res?.data?.userRank?.rank) {
            setMyRank(res.data.userRank.rank);
            }

        } catch (e) {
            console.error("Error loading top data", e);
        } finally {
            setLoading(false);
        }
    };

    const openPost = (id) => {
        navigate('/post/'+id);
        setShowModal(null);
    }

    const returnContentHtml = (myAward) => {
        return (
            <ul>
                {
                    myAward.map(item => item.description).
                    map((item, index) =>(
                        <li key={`award${index}`}>
                            {item}
                        </li>
                    ))
                }
            </ul>
        )
    }
    useEffect(() => {
        getNextReset();
        getMyResults();
        getTopViews();
    }, []);

    return (
        <div className={classes.champions}>
            <div className={classes.sortBy}>
                <div className={classes.sortType}>
                    {topTypes.map((type) => (
                    <span
                        key={type.id}
                        onClick={() => setSortType(type.id)}
                        className={sortType === type.id ? classes.active : ''}
                    >
                        {type.label}
                    </span>
                    ))}
                </div>

                <ul>
                    {filteredList.map((item, index) => (
                    <li
                        key={`item-${index}`}
                        onClick={() => onSortByClick(item)}
                        className={item.label === currentTop?.label ? classes.active : ''}
                    >
                        {item.label}
                    </li>
                    ))}
                </ul>
            </div>
            <div className={classes.countdown}>
                   <WeeklyChampionCountdown nextReset={nextReset} week={week} />
            </div>
            <div className={classes.board}>
                {
                    loading &&
                    <Loader />
                }
                {
                    results.length === 0 && !loading &&
                    <div className={classes.noItem}>No item found.</div>
                }
                {
                    results.length > 0 &&
                    <ul>
                        {
                            results.map((item, index) => 
                                <li key={`result${index}`} className={classNames(classes['rank'+(index+1)], {[classes.myResult]:myRank === (index+1) && !item.author})}>
                                    <span className={classes.rank}>{index > 2 ? index+1 : ''}</span>
                                    {
                                        item.title &&
                                        <div className={classes.box} onClick={() => openPost(item._id)}>{item.title}</div>
                                    }
                                    {
                                        item.content &&
                                        <div className={classes.box} onClick={() => openPost(item.itemId)}>{item.content}</div>
                                    }
                                    <div className={classes.author}>
                                        {item.author ?
                                             <>
                                                <img src={item.author?.avatar} alt='avatar' height={40} />
                                                {item.author && item.author.fullName ? item.author.fullName : item.author.username}
                                            </> : 
                                            <>
                                                <img src={item.avatar} alt='avatar' height={40} />
                                                {item.fullName ? item.fullName : item.username}
                                            </>
                                        }
                                    </div>
                                    
                                    <div className={classes.score}>
                                        {item[currentTop.id === 'topLikedComments' ? 'noOfLikes' : currentTop.id]}
                                        <span>{currentTop.unit}</span>
                                    </div>
                                    <div className={classes.award}>
                                        <StarPoints points={item.award} size={25} />
                                        <span className={classes.unit}>award</span>
                                    </div>
                                </li>
                            )
                        }
                    </ul>
                }
            </div>
            {
                showMyAward && myAward && myAward.length > 0 &&
                <CongratsBanner
                    visible={showMyAward}
                    points={myAward.map(item => item.points).reduce((item, total) => total = total + item)}
                    content={returnContentHtml(myAward)}
                    time={6}
                    onClose={onCongratsClose}
                />
            }
            
        </div>
    )
}

export default Champions;