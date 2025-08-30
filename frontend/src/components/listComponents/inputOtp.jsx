import { useStore } from '@/store/useStore';
import classes from './styles.module.scss';
import { useNavigate } from 'react-router-dom';
import VerifyOtp from '../otpInput';

export const InputOTP = () => {
    const {showModal, setShowModal, user, setLoadViewContent} = useStore();
    const navigate = useNavigate();
    let itemId = null;
    if (showModal.split('-').length > 1){
        itemId = showModal.split('-')[1]
    }

    const onVerifySuccess = () => {
        const path = window.location.pathname;
        setShowModal(null);
        if (path.includes('post')) {
            setLoadViewContent(true);
        } else {
            navigate('/post/'+itemId);
        }
    }

    return (
        <div className={classes.addPassword}>
            <p>An email with a OTP code was just sent to <b>{user && user.email}</b>, <br /> This code is valid for 5 minutes.</p>
            {
                itemId &&
                <VerifyOtp email={user && user.email} onSuccess={onVerifySuccess} itemId={itemId} />
            }
        </div>
    )
}