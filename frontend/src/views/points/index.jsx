import { useEffect, useState } from 'react';
import classes from './styles.module.scss';
import api from '@/services/api';
import urls from '@/sharedConstants/urls';
import Pagination from '@/components/pagination';
import data from './ruleData.js';
import medalData from './medalData.js';
import { BuyStars, List, SendStars } from './components.jsx';

const PointsHistory = ({isUser, type, userInfo}) => {
    const [list, setList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [total, setTotal] = useState(0);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        callListApi(page);
      };
    
    const callListApi = async (page) => {
        try {
            const list = await api.get(urls.GET_POINTS_HISTORY + '?page=' + page);
            if (list.data && list.data.data) {
                setList(list.data.data);
                list.data.totalResults && setTotal(list.data.totalResults);
                list.data.pageCount && setPageCount(list.data.pageCount);
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(()=>{
        isUser && callListApi(1);
    }, []);

    return (
        <div className={classes.pointsHistory}>
            <h1>
                {type}
            </h1>
            {
                type === 'Stars History' && isUser &&
                <p className='note'>Stars History will be cleared every 3 months</p>
            }
            {
                ['Stars Guide', 'Stars History'].includes(type) &&
                <List list={type === 'Stars History' && isUser ? list : data} />
            }
            {
                type === 'Stars History' &&
                <Pagination
                    currentPage={currentPage}
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    total={total}
                />
            }
            {
                type === 'Send Stars' &&
                <SendStars userInfo={userInfo} />
            }
            {
                type === 'Buy more Stars' &&
                <BuyStars />
            }
        </div>
    )
}

export const MedalRules = () => {
    return (
        <div className={classes.pointsHistory}>
            <h1>Medal Rules</h1>
            <List list={medalData} />
        </div>
    )
}
export default PointsHistory;