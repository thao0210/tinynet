import classes from './styles.module.scss';
import { useState, useEffect, useRef, useMemo } from 'react';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import Loader from '@/components/loader';
import { FaSearch } from "react-icons/fa";
import useClickOutside from '@/hooks/useClickOutsite';

const SearchUsers = ({ users, setUsers, datafield, onlyOne }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSug, setLoadingSug] = useState(false);
    const [showQuickResults, setShowQuickResults] = useState(false);
    const ref = useRef();
    useClickOutside(ref, () => setShowQuickResults(false));

    // --- Chuẩn hoá users để render ---
    const normalizedUsers = useMemo(() => {
        if (!users) return [];
        if (onlyOne) {
            // users = string → tìm object trong suggestions để hiển thị đẹp
            const found = suggestions.find(s => s.username === users);
            return found ? [found] : [{ username: users }];
        }
        return Array.isArray(users) ? users : [];
    }, [users, onlyOne, suggestions]);

    const searchOnChange = (e) => {
        setQuery(e.target.value);
    };

    const onSelect = (sug) => {
        if (onlyOne) {
            // chỉ lưu username string
            setUsers(sug.username);
        } else {
            setUsers((prev) => {
                if (Array.isArray(prev)) {
                    const updated = [...prev, sug].filter(
                        (user, index, self) =>
                            self.findIndex(u => u.username === user.username) === index
                    );
                    return updated;
                }

                const updatedField = [...(prev[datafield] || []), sug].filter(
                    (user, index, self) =>
                        self.findIndex(u => u.username === user.username) === index
                );

                return {
                    ...prev,
                    [datafield]: updatedField,
                };
            });
        }

        setShowQuickResults(false);
        setSuggestions([]);
        setQuery('');
    };

    const removeUser = (index) => {
        if (onlyOne) {
            setUsers('');
            return;
        }

        setUsers((prev) => {
            if (Array.isArray(prev)) {
                return prev.filter((_, i) => i !== index);
            }

            return {
                ...prev,
                [datafield]: (prev[datafield] || []).filter((_, i) => i !== index),
            };
        });
    };

    const onBlurHandle = () => {
        setTimeout(() => setShowQuickResults(false), 200);
    };

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

        const delaySearch = setTimeout(fetchSuggestions, 300); // debounce 300ms
        return () => clearTimeout(delaySearch);
    }, [query]);

    return (
        <div className={classes.search}>
            <ul>
                {normalizedUsers.length > 0 &&
                    normalizedUsers.map((user, index) => (
                        <li key={`user${index}`}>
                            {user.avatar && <img src={user.avatar} height={15} alt="avatar" />}
                            {user.fullName ? user.fullName : user.username}
                            <span onClick={() => removeUser(index)}>&times;</span>
                        </li>
                    ))}
            </ul>

            {((onlyOne && normalizedUsers.length === 0) || !onlyOne) && (
                <div className={classes.box} ref={ref}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search user"
                        value={query}
                        onBlur={onBlurHandle}
                        onChange={searchOnChange}
                    />
                    {query && showQuickResults && (
                        <div className={classes.quickResult}>
                            {loadingSug && <Loader />}
                            {suggestions.length > 0 && (
                                <ul>
                                    {suggestions.map((sug, index) => (
                                        <li key={`sug${index}`} onClick={() => onSelect(sug)}>
                                            {sug.avatar && <img src={sug.avatar} alt="avatar" height={20} />}
                                            {sug.fullName ? sug.fullName : sug.username}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {suggestions.length === 0 && !loadingSug && <p>No user found.</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchUsers;
