import { useState} from 'react';

export const useGlobalStates = () => {
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadList, setLoadList] = useState(false);
    const [itemId, setItemId] = useState('');
    const [curItemId, setCurItemId] = useState(null);
    const [searchFor, setSearchFor] = useState('');
    const [list, setList] = useState([]);
    const [loadViewContent, setLoadViewContent] = useState(false);
    const [customValues, setCustomValues] = useState({
        color: '#ffffff',
        images: []
    });
    const [curTheme, setCurTheme] = useState(localStorage.getItem('currentTheme') || 'pastel');
    return {
        user, setUser, showModal, setShowModal, loading, setLoading, loadList, setLoadList,
        itemId, setItemId, curItemId, setCurItemId, searchFor, setSearchFor, list, setList,
        loadViewContent, setLoadViewContent, customValues, setCustomValues, curTheme, setCurTheme
    }
}