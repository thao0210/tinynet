import { useState } from 'react';
import styles from './styles.module.scss';
import { useStore } from '@/store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import Upass from './upass';
import EmailOtp from './emailOtp';
import OtpBox from './otpBox';

const Login = ({nextModal}) => {
    const location = useLocation();
    const [showPassField, setShowPassField] = useState(false || !!localStorage.getItem('hasAccountPassword'));
    const [showOtpBox, setShowOtpBox] = useState(false);
    const [email, setEmail] = useState('');

    const googleLogin = () => {
        // Redirect to Google OAuth
        if (import.meta.env.VITE_GOOGLE_URL) {
            window.location.href = import.meta.env.VITE_GOOGLE_URL; 
        }
    }

    return (
    <div className={classNames(styles.login, {[styles.page]: location.pathname.includes('login')})}>
        {
            !showOtpBox &&
            <div>
                {
                    showPassField ?
                    <Upass nextModal={nextModal} /> :
                    <EmailOtp setShowOtpBox={setShowOtpBox} email={email} setEmail={setEmail} />
                }
                <div>
                    <div className={styles.or}>or</div>
                    <div className={styles.others}>
                        <span onClick={googleLogin}><img src='/google.svg' height={25} /> Google</span>
                        {
                            !showPassField ?
                            <span onClick={() => setShowPassField(true)}><img src='/key.svg' height={25} />Password</span> :
                            <span onClick={() => setShowPassField(false)}><img src='/shield.svg' height={25} />Email OTP</span>
                        }
                    </div>
                </div>
                <p className={styles.note}>Using <strong onClick={() => setShowPassField(false)}>Email OTP</strong> or <strong onClick={googleLogin}>Google</strong> to sign up or sign in. </p>
            </div>
        }
        {
            showOtpBox &&
            <OtpBox setShowOtpBox={setShowOtpBox}  email={email}/>
        }
    </div>
    )
}

export default Login;