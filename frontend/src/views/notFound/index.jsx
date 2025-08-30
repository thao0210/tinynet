import { useNavigate } from 'react-router-dom';
import classes from './styles.module.scss';

const NotFound = () => {
    const navigate = useNavigate();
    
    return (
        <div className={classes.notFound}>
            <img onClick={() => navigate('/')} src='/logo.svg' alt='logo' width={60} />
            <h2>Page not found</h2>
            <a href="/list">Back to HOME</a>
        </div>
    )
}

export default NotFound;