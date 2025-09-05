import classes from './styles.module.scss';
import { formatDate } from '@/utils/numbers';
import { StarPoints } from '@/components/Utilities';
import { useStore } from '@/store/useStore';
import SearchUsers from '@/components/searchUsers';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import urls from "@/sharedConstants/urls";
import toast from 'react-hot-toast';
import PayPalBuy from '@/components/paypalBuy';
import Modal from '@/components/modal';
const starsPackage = [
    {
        id: 'p1',
        points: 1000,
        price: 2
    },
    {
        id: 'p2',
        points: 5000,
        price: 8.5
    },
    {
        id: 'p3',
        points: 10000,
        price: 15
    },
    {
        id: 'p4',
        points: 50000,
        price: 60
    },
    {
        id: 'p5',
        points: 100000,
        price: 90
    },
    {
        id: 'p6',
        points: 500000,
        price: 300
    }
]
export const List = ({list}) => {
    return (
        <ul className={classes.list}>
            {
                list.map((item, index) => (
                    <li key={`history${index}`} className={item.points < 0 || item.value < 0 ? classes.red : ''}>
                        {
                            item.image &&
                            <img src={item.image} height={60} />
                        }
                        {
                            item.createdAt &&
                            <span className={classes.date}>{formatDate(item.createdAt)}</span>
                        }
                        <span className={classes.type}>{item.description || item.name}</span>
                        <strong><StarPoints points={item.points || item.value || item.range} size={23} /></strong>
                    </li>
                ))
            }
        </ul>
    )
};

export const SendStars = ({userInfo}) => {
    const {user, setUser} = useStore();
    const [stars, setStars] = useState(100);
    const [usersForPoints, setUsersForPoints] = useState('');

    const handleChange = (e) => {
        const value = parseInt(e.target.value);
        if (value < 100) e.target.value = 100;
        else if (value > 5000) e.target.value = 5000;

        setStars(e.target.value);
      };
    const sendStars = async () => {
        try {
            const send = await api.post(urls.SEND_STARS, {username: usersForPoints, amount: stars});
            if (send.data) {
                toast.success(`Sent to ${usersForPoints} ${stars} stars successfully!`);
                setUser(prev => ({...prev, userPoints: prev.userPoints - stars}));
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className={classes.sendStars}>
            <p className='note'>Max stars can be sent will be 5000 <img src='/star.webp' alt='star' height={20} />, min stars can be sent will be 100 <img src='/star.webp' alt='star' height={20} /></p>
            <div>
                <label>Your current stars</label>
                <div>
                    <StarPoints points={user.userPoints} size={25} />
                </div>
            </div>
            
                <div>
                    <label>Send to {
                        userInfo._id !== user._id &&
                        <strong>{userInfo && (userInfo.fullName || userInfo.username)}</strong>
                        }
                    </label>
                    {
                        userInfo._id === user._id &&
                        <div>
                            <SearchUsers users={usersForPoints || ''} setUsers={setUsersForPoints} onlyOne={true} />
                        </div>
                    }
                    <div className={classes.stars}>
                        <input type='number' min={100} max={user.userPoints} value={stars} onChange={handleChange} />
                        <img src='/star.webp' alt='star' height={25} />
                    </div>
                </div>
            <div>
                <button className="btn" onClick={sendStars}>Send</button>
            </div>
        </div>
    )
}

export const BuyStars = ({}) => {
    const {user} = useStore();
    const [selectedPackage, setSelectedPackage] = useState(null);

    return (
        <div className={classes.starsList}>
            <ul>
                {
                    starsPackage.map((item, index) => (
                        <li key={`package${index}`}>
                            <StarPoints points={item.points} size={25} />
                            <span><strong>{item.price}</strong> USD</span>
                            <button className="btn" onClick={() => setSelectedPackage(item)}>Buy</button>
                        </li>
                    ))
                }
            </ul>
            {selectedPackage && (
                <Modal setShowModal={setSelectedPackage} width={600}>
                    <div className={classes.paypalPay}>
                        <h3>Pay for the package: <StarPoints points={selectedPackage.points} size={25} /></h3>
                        <PayPalBuy selectedPackage={selectedPackage} onSuccess={() => {
                            toast.success('You have just bought the package successfully!');
                            setSelectedPackage(null);
                        }} />
                    </div>
                </Modal>
            )}
        </div>
    )
}