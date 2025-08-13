import { useState } from 'react';
import classes from './styles.module.scss';
import CoinFlipGame from './games/coin';
import LuckyWheel from './games/luckyWheel';
import Modal from '@/components/modal';
import FastTypingGame from './games/typing';
import LotteryGame from './games/lottery';
import urls from '@/sharedConstants/urls';

const baseUrl = import.meta.env.VITE_R2_BASE_URL;
const GAMES = [{
    name: 'Coin Flip',
    stars: 5,
    img: baseUrl + '/flip-coin.webp'
}, {
    name: 'Lucky Wheel',
    stars: 10,
    img: baseUrl + '/wheel.webp'
}, {
    name: 'Fast Typing',
    stars: 5,
    img: baseUrl + '/typing.webp'
}, {
    name: 'Lottery Numbers',
    stars: 15,
    img: baseUrl + '/lottery.webp'
}]

const Games = () => {
    const [game, setGame] = useState(null);
    
    return (
        <div className={classes.games}>
            <h1>Games</h1>
            <ul>
                {
                    GAMES.map((item, index) => (
                        <li key={`game${index}`} onClick={() => setGame(item.name)}>
                            <h3>{item.name}</h3>
                            <img src={item.img} alt={item.name} />
                        </li>
                    ))
                }
            </ul>
            {
                game &&
                <Modal setShowModal={setGame} isFull={true}>
                    <div className={classes.cover}>
                    {
                        game === 'Coin Flip' &&
                        <CoinFlipGame />
                    }
                    {
                        game === 'Lucky Wheel' &&
                        <LuckyWheel />
                    }
                    {
                        game === 'Fast Typing' &&
                        <FastTypingGame />
                    }
                    {
                        game === 'Lottery Numbers' &&
                        <LotteryGame />
                    }
                    </div>
                </Modal>
            }
            
        </div>
    )
}

export default Games;