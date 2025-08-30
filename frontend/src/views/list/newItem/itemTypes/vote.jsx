import classes from '../styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import RadioList from '@/components/radio';
import classNames from 'classnames';
import SearchUsers from '@/components/searchUsers';
import { useStore } from '@/store/useStore';
import { IoMdCheckboxOutline } from 'react-icons/io';
import { MdCheckBoxOutlineBlank } from 'react-icons/md';
import Pagination from '@/components/pagination';
import { ItemType } from '@/components/listComponents/itemType';

const Vote = ({data, setData, curItemId}) => {
    const [items, setItems] = useState(null);
    const {user, curTheme} = useStore();
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    const handlePageChange = (page) => {
      setCurrentPage(page);
      fetchItems(page);
    };

    const handleTitleInput = (e) => {
        setData({...data, title: e.target.value});
    }

    const handleDescriptionInput = (e) => {
        setData({...data, description: e.target.value});
    }

    const toggleSelectItem = (id) => {
        setData((prev) => ({
            ...prev,
            items: prev.items?.includes(id) ? prev.items.filter(_id => _id !== id) : [...(prev.items || []), id]
        }))
    }

    const fetchItems = async (page) => {
        try {
            const res = await api.get(curItemId ? `${urls.SEARCH_ITEMS}?page=${page}&userId=${user._id}&itemId=${curItemId}` : `${urls.SEARCH_ITEMS}?page=${page}&userId=${user._id}`);
            if (res.data) {
            setItems(res.data.results);
            setPageCount(res.data.pageCount);
            setTotal(res.data.totalResults);
            }
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };
    useEffect(()=>{
        if (data && data.voteType) {
            setData({...data, items: [], users: []});
            data.voteType === 'posts' && fetchItems(1);
        }
    }, [data && data.voteType]);

    useEffect(()=>{
        setData({...data, voteType: 'posts', voteMode: 'only-one'});
    }, []);

    return (
        <div className={classes.share}>
            <div>
                <label>Vote Type</label>
                <RadioList
                    list={['posts', 'users', 'custom']}
                    disabled={[1,2]}
                    value={data.voteType || 'posts'}
                    setValue={setData}
                    data={data}
                    datafield='voteType'
                />
            </div>
            {
                data.voteType === 'posts' &&
                <div>
                    <label>Select posts to vote (at least 2 posts)</label>
                    <div className={classNames(classes.items, curTheme)}>
                        {
                            items && items.length > 0 && 
                            items.map((item, index) => 
                                <div key={`item${index}`} className={classNames('item'+index,item.type,{[classes.active]: data.items && data.items.length > 0 && data.items.includes(item._id)}, {[classes.disabled]: item.password || item.sendOtp})} onClick={() => toggleSelectItem(item._id)}>
                                    <h3>{item.title}</h3>
                                    <ItemType item={item} />
                                    {
                                        data.items && data.items.length > 0 && data.items.includes(item._id) ?
                                        <IoMdCheckboxOutline/> :
                                        <MdCheckBoxOutlineBlank />
                                    }
                                </div>
                            )
                        }
                        {
                            items && items.length === 0 &&
                            <div className={classes.noItem}>No Items found.</div>
                        }
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        pageCount={pageCount}
                        onPageChange={handlePageChange}
                        total={total}
                    />
                </div>
            }
            {
                data.voteType === 'users' &&
                <SearchUsers users={data.usersForVote || []} setUsers={setData} datafield='usersForVote' />
            }
            {
                data.voteType === 'custom' &&
                <div>
                    <label>Add new items to vote</label>
                </div>
            }
        </div>
    )
}

export default Vote;