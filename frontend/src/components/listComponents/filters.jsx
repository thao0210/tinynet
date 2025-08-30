import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import classes from './styles.module.scss';
import useClickOutside from '@/hooks/useClickOutsite';
import Dropdown from '@/components/dropdown';
import DateTimePicker from '@/components/timepicker';
import Checkbox from '@/components/checkbox';
import Tippy from '@tippyjs/react';
import ReactDOM from 'react-dom';
import {ITEM_TYPE, SORT_BY} from '@/sharedConstants/data';

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