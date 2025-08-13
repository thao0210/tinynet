import classes from './styles.module.scss';
import classNames from 'classnames';

const FlyPoint = ({point}) => {
    return (
        <div className={classNames(classes.flyPoint, {[classes.plus]: point > 0})}>{point > 0 ? '+'+point : point}</div>
    )
}

export default FlyPoint;