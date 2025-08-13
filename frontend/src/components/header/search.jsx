import classes from './styles.module.scss';
import { useState, useEffect, useRef } from 'react';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import Loader from '@/components/loader';
import { useStore } from '@/store/useStore';
import { FaSearch } from "react-icons/fa";
import { FaCircleArrowRight } from "react-icons/fa6";
import useClickOutside from '@/hooks/useClickOutsite';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';

const SearchBar = ({
    setHasMore, 
    setPage, 
    setSearchPage, 
    setSearchHasMore, 
    callSearchItem 
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSug, setLoadingSug] = useState(false);
    const [showQuickResults, setShowQuickResults] = useState(false);
    const {setSearchFor} = useStore();
    const searchRef = useRef();
    const location = useLocation();

    useClickOutside(searchRef, () => setShowQuickResults(false));

    const searchOnChange = (e) => {
        setQuery(e.target.value);
    }

    const onSearch = async (query) => {
        if (!query.trim()) return;
        
        setPage(1);
        setHasMore(false); // vì đang search
        setSearchPage(1);
        setSearchHasMore(true);
        setSearchFor(query);

        callSearchItem(1, query);
        setSearchPage(2); // sau lần search đầu, page sẽ là 2
    }

    const onSelect = (query) => {
        setQuery(query);
        onSearch(query);
    }

    const onBlurHandle = () => {
        setTimeout(() => setShowQuickResults(false), 200);
    }

    const onkeySearch = (e) => {
        if (e.key === 'Enter') {
            onSelect(query);
            setShowQuickResults(false);
        }
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
            const response = await api.get(`${urls.SEARCH_AC}?query=${query}`);
            setSuggestions(response.data);
          } catch (error) {
            console.error('Error fetching suggestions:', error);
          }
          setLoadingSug(false);
        };
    
        const delaySearch = setTimeout(fetchSuggestions, 300); // Debounce 300ms
        return () => clearTimeout(delaySearch); // Cleanup timeout
      }, [query]); // Chạy khi query thay đổi

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            // setQuery(searchParam);
            onSearch(searchParam);
            setShowQuickResults(false);
        }
    }, [location.search]);

    return (
        <div className={classNames(classes.search, 'searchBar')} ref={searchRef}>
            <FaSearch color="orange" onClick={() => onSelect(query)} size={22}/>
            <input type='text' autoComplete='new-search' placeholder='Search' value={query} 
            onBlur={onBlurHandle} onChange={searchOnChange} onKeyDown={onkeySearch} />
            {
                query && showQuickResults &&
                <div className={classNames(classes.quickResult, 'quickResult')}>
                    {loadingSug && <Loader />}
                    { suggestions.length > 0 && (
                        <ul>
                            {suggestions.map((sug, index) => (
                            <li key={`sug${index}`} onClick={() => onSelect(sug)}>
                                <FaCircleArrowRight size={20} color='#fec864' />
                                {sug}
                            </li>
                        ))}
                        </ul>
                    )}
                    {
                        suggestions.length === 0 && !loadingSug &&
                        <p>No suggestions found.</p>
                    }
                </div>
            }
        </div>
    )
}

export default SearchBar;