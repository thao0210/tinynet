import classes from './styles.module.scss';
import { useStore } from '@/store/useStore';
import api from '@/services/api';
import urls from '@/sharedConstants/urls';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import { CountdownDateTime } from "@/components/countdown";
import { BsGlobe2 } from 'react-icons/bs';
import { getTitleByLang } from '@/utils/lang';
import { ItemMenus } from './itemMenus';
import { ItemType } from './itemType';

export const Item = ({item, setShowModal, className}) => {
    const {user} = useStore();
    const navigate = useNavigate();
    const myPost = item?.author && item?.author?.username && (user?.username === item?.author?.username);
    const onItemClick = async () => {
        if (item.hasPass) {
            let hint = '';
            if (item.passwordHint) {
                hint = item.passwordHint;
            }
            setShowModal(`itemPassword-${item._id}-${hint}`);
        } else if(item.sendOtp) {
            //api sendOtp
            const sendOtp = await api.post(urls.ITEM_SEND_OTP, {email: user.email});
            if (sendOtp.data) {
                setShowModal('itemOtp-'+item._id);
            }
        } else {
            navigate('/post/' + (item.slug || item._id));
        }
    }

    return (
        <Tippy content={`Recommended ${item.type}`} disabled={!item.isCurrentlyPromoted}>
        <div className={classNames(classes.item, className, item.type, {[classes.locked]: item.hasPass || item.sendOtp, [classes.promoted]: item.isCurrentlyPromoted})}>
            {
                item.type === 'vote' &&
                <div className={classes.alert}>
                    {
                        item.deadline && user && user.timezone &&
                        <CountdownDateTime deadline={item.deadline} userTimezone={user.timezone} />
                    }
                </div>
            }
            <div onClick={onItemClick}>
                {
                    item.showTitle &&
                    <h3>
                        {
                            item.type === "card"
                            ? (item.cardMeta?.[navigator.language]?.title || "card")
                            : (item?.translations?.length > 0
                                ? getTitleByLang(item, navigator.language)
                                : (item?.title || ""))
                        }
                        {item.type === 'collection' && item.items && item.items.length ? <sup>{item.items.length}</sup>: ''}
                    </h3>                                                                                                                                
                }
                <ItemType item={item} />
            </div>
            {
                item.language && item.translations?.length > 0 &&
                <Tippy content='Available in multi languages'>
                <span className={classNames(classes.multiLanguages, 'multiLanguages')}>
                    <BsGlobe2 />
                </span>
                </Tippy>
            }
            <div className={classes.infos}>
                {
                    (user) &&
                    <ItemMenus item={item} isMyPost={myPost} isUser={user} showUser={true} />
                }
            </div>
        </div>
        </Tippy>
    )
}