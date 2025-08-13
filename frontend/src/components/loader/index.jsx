import classes from './styles.module.scss';
import classNames from 'classnames';

const Loader = ({isSmall, color}) => {
    return (
        <div className={classNames(classes.loader, {[classes.small]: isSmall})} style={{'--loader-color':color}}>
        <span></span>
        </div>
    )
}

export const LoadingDots = () => {
    <div className="loading-dots"><span></span><span></span><span></span></div>
}
export default Loader;