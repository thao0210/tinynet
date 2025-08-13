import classes from './styles.module.scss';
import { useState, useEffect, useRef } from 'react';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import Loader from '@/components/loader';
import { FaSearch } from "react-icons/fa";
import useClickOutside from '@/hooks/useClickOutsite';

const SearchUsers = ({users, setUsers, datafield, onlyOne}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSug, setLoadingSug] = useState(false);
    const [showQuickResults, setShowQuickResults] = useState(false);
    const ref = useRef();
    useClickOutside(ref, () => setShowQuickResults(false));

    const searchOnChange = (e) => {
        setQuery(e.target.value);
    }

    const onSelect = (sug) => {
        setUsers((prev) => {
            // Nếu là array (dữ liệu đơn giản)
            if (Array.isArray(prev)) {
                const updated = [...prev, sug].filter(
                    (user, index, self) =>
                        self.findIndex(u => u.username === user.username) === index
                );
                return updated;
            }
    
            // Nếu là object và datafield nằm bên trong
            const updatedField = [...(prev[datafield] || []), sug].filter(
                (user, index, self) =>
                    self.findIndex(u => u.username === user.username) === index
            );
    
            return {
                ...prev,
                [datafield]: updatedField,
            };
        });

        setShowQuickResults(false);
        setSuggestions([]);
    }

    const removeUser = (index) => {
        setUsers((prev) => 
            {
                if (Array.isArray(prev)) {
                    return prev.filter((_, i) => i !== index);
                }
        
                return {
                    ...prev,
                    [datafield]: (prev[datafield] || []).filter((_, i) => i !== index),
                };
            })
    }

    const onBlurHandle = () => {
        setTimeout(() => setShowQuickResults(false), 200);
    }

    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }
    
        setShowQuickResults(true);
        const fetchSuggestions = async () => {
            setLoadingSug(true);
            try {
            const response = await api.get(`${urls.SEARCH_USERS}?query=${query}`);
            setSuggestions(response.data);
            } catch (error) {
            console.error('Error fetching suggestions:', error);
            }
            setLoadingSug(false);
        };
    
        const delaySearch = setTimeout(fetchSuggestions, 300); // Debounce 300ms
        return () => clearTimeout(delaySearch); // Cleanup timeout
        }, [query]); // Chạy khi query thay đổi

    return (
        <div className={classes.search}>
            <ul>
                {
                    users && users.length > 0 && users.map((user, index) => 
                        <li key={`user${index}`}>
                            <img src={user.avatar} height={15} alt='avatar' />
                            {user.fullName ? user.fullName : user.username}
                            <span onClick={() => removeUser(index)}>&times;</span>
                        </li>
                    )
                }
            </ul>
            { ((onlyOne && users.length === 0) || !onlyOne) &&
                <div className={classes.box} ref={ref}>
                    <FaSearch onClick={() => onSelect(query)}/>
                    <input type='text' placeholder='Search user' value={query} 
                    onBlur={onBlurHandle} onChange={searchOnChange} />
                    {
                        query && showQuickResults &&
                        <div className={classes.quickResult}>
                            {loadingSug && <Loader />}
                            { suggestions.length > 0 && (
                                <ul>
                                    {suggestions.map((sug, index) => (
                                    <li key={`sug${index}`} onClick={() => onSelect(sug)}>
                                        <img src={sug.avatar} alt='avatar' height={20} />
                                        {sug.fullName ? sug.fullName : sug.username}
                                    </li>
                                ))}
                                </ul>
                            )}
                            {
                                suggestions.length === 0 && !loadingSug &&
                                <p>No user found.</p>
                            }
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default SearchUsers;