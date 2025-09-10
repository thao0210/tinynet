import UserAvatar from '@/components/userAvatar';
import themeClasses from './themes.module.scss';
import classNames from 'classnames';
import { useVote } from '@/contexts/voteContext';
import { Languages } from "../newItem/itemTypes/generalComponents";

const ItemFooter = ({ item, activeLang, setActiveLang, languages }) => {
    return (
        <div className={classNames(themeClasses.footer, 'footer')}>
            {item?.author && (
                <UserAvatar
                    avatar={item.author.avatar || ''}
                    name={item.author?.fullName || item.author?.username}
                    date={item.date}
                    profileId={item.author._id}
                    isAnonymous={item.isAnonymous}
                />
            )}
            {
                languages.length > 1 &&
                <Languages
                    isView={true}
                    activeLang={activeLang}
                    setActiveLang={setActiveLang}
                    languages={languages}
                    onLanguageChange={(lang) => {
                        setActiveLang(lang);
                    }}
                />
            }
        </div>
    );
};

export default ItemFooter;
