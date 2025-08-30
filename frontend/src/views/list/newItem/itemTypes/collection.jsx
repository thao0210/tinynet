import classes from '../styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useStore } from '@/store/useStore';
import { IoMdCheckboxOutline } from 'react-icons/io';
import { MdCheckBoxOutlineBlank } from 'react-icons/md';
import Pagination from '@/components/pagination';
import { ItemType } from '@/components/listComponents/itemType';

const Collection = ({data, setData, curItemId}) => {
    const [items, setItems] = useState([]);
    const {user, curTheme} = useStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [total, setTotal] = useState(0);
  
    const handlePageChange = (page) => {
      setCurrentPage(page);
      fetchItems(page);
    };

    const handleNameInput = (e) => {
        const name = e.target.value;
        setData({...data, title: name});
    };

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
        fetchItems(1);
    }, []);

    return (
        <div className={classes.collection}>
            <div>
                <label>Select items to collection</label>
                <div className={classNames(classes.items, curTheme)}>
                    {
                        items && items.length > 0 && 
                        items.map((item, index) => 
                            <div key={`item${index}`} className={classNames('item'+index, item.type, {[classes.active]: data.items && data.items.length > 0 && data.items.includes(item._id)}, {[classes.disabled]: item.password || item.sendOtp})} onClick={() => toggleSelectItem(item._id)}>
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
                        items.length === 0 &&
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
        </div>
    )
}

export default Collection;