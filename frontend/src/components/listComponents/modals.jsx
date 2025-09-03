import Modal from '@/components/modal';
import classes from './styles.module.scss';
import { useNavigate } from 'react-router-dom';

export const PasswordModal = ({setShowModal}) => {
    const navigate = useNavigate();
    const onSetPass = () => {
        navigate('/myProfile?tab=change-password');
        localStorage.setItem('viewedPassInfo', true);
        setShowModal(false);
    }

    const onSkip = () => {
        setShowModal(false);
        localStorage.setItem('viewedPassInfo', true);
    }
    return (
        <Modal setShowModal={setShowModal} width={500}>
            <div className={classes.modalContent}>
                <h4>You’ve successfully signed up!</h4>
                <p>
                    To make logging in easier next time, you can set a password now.
                </p>
                <p>You can find this option under <strong>Profile → Change password</strong> or click the button below.
                </p>
                <div className='buttons'>
                    <button className='btn' onClick={onSetPass}>Set password now</button>
                    <button className='btn sub' onClick={onSkip}>Ok / Maybe later</button>
                </div>
            </div>
        </Modal>
    )
}