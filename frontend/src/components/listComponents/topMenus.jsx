import { useStore } from '@/store/useStore';
import ItemMenus from '@/components/itemMenu';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';

export const TopMenus = ({item, isView, isMyPost, isUser, noDots, showUser}) => {
    const {setLoadList, setCurItemId, setShowModal} = useStore();
    const navigate = useNavigate();

    const onEdit = (e) => {
        e.stopPropagation();
        setCurItemId(item._id);
        setShowModal('newItem');
    }

    const onDelete = async (e) => {
        e.stopPropagation();
        const confirm = window.confirm('Do you want to remove this?');
        if (confirm) {
            const deleteComment = await api.delete(`${urls.LIST}/${item._id}`);
            if (deleteComment.data) {
                isView && setShowModal('');
                setLoadList(true);
                navigate('/list');
            }
        }
    }

    const onReport = (e) => {
        e.stopPropagation();
        setShowModal('report-item-' + item._id);
    }

    const onHideItem = async (e) => {
        e.stopPropagation();
        try {
            const hideItem = await api.post(`${urls.HIDE_ITEM}/${item._id}`);
            if (hideItem.data) {
                setLoadList(true);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <ItemMenus
            item={item}
            onDelete={onDelete}
            onEdit={onEdit}
            onReport={onReport}
            isMyPost={isMyPost}
            onHideItem={onHideItem}
            isUser={isUser}
            noDots={noDots}
            showUser={showUser}
        />
    )
}