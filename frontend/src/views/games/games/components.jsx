import { useAnimatedCount } from "@/hooks/useAnimatedCount";
import star from '@/assets/star.svg';
import classes from '../styles.module.scss';

export const YourPoints = ({prevScore, score}) => {
    const animatedScore = useAnimatedCount(prevScore, score, 1000);
    return (
        <div className={classes.yourPoints}>
            <label>Your points</label>
            <div>
                {animatedScore} <img src={star} height='35' />
            </div>
        </div>
    )
}