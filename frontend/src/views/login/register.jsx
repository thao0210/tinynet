import { useState } from 'react';
import urls from '@/sharedConstants/urls';
import styles from './styles.module.scss';
import { useStore } from '@/store/useStore';
import classNames from 'classnames';
import { MdEmail} from 'react-icons/md';
import api, { setAccessToken } from "@/services/api";
import { useNavigate, useLocation } from 'react-router-dom';
import CountdownTimer from '@/components/countdown';
import Loader from '@/components/loader';
import toast from 'react-hot-toast';
import ReferrerInput from './referrerInput';
import Checkbox from '@/components/checkbox';
import VerifyOtp from '@/components/otpInput';
  
const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {setUser, setLoading, loading, setShowModal} = useStore();
    
    const [error, setError] = useState({case: null, message: ''});
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const [verified, setVerified] = useState(false);
    const [showOtpBox, setShowOtpBox] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const userLang = navigator.language || navigator.userLanguage || 'en-US';
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const [showReferer, setShowReferrer] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(null);

    const [account, setAccount] = useState({
        email: '',
        referrer: ''
    })

    const handleVerifyEmail = async () => {
        if (!account.email.toLowerCase().match(emailRegex)) {
            toast.error('Please provide right email format!')
            return;
        }
        setLoading(true);
        try {
        const sendOtp =  await api.post(urls.SEND_VERIFICATION_EMAIL, {email: account.email});
        if (sendOtp.data) {
            setShowOtpBox(true);
            setLoading(false);
        }
        } catch (error) {
            if (error) {
                setLoading(false);
            }
        }
    }

    const handleBlurEmail = async () => {
        if (!account.email) return;
        if (!account.email.toLowerCase().match(emailRegex)) {
            toast.error('Please provide right email format!')
            return;
        }
        const res = await api.get(`${urls.CHECK_EMAIL}/${account.email}`);
        const data = await res.data;
        setEmailAvailable(data.available);
    };

    const onRegister = async () => {
        try {
            // create a random avatar
            const baseUrl = import.meta.env.VITE_R2_BASE_URL;
            const avatarUrl = `${baseUrl}/avatar/${Math.round(Math.random()*40)}.webp`;
            setLoading(true);
            const register = await api.post(urls.REGISTER, {
                email: account.email,
                avatar: avatarUrl,
                referrer: account.referrer,
                timezone: userTimezone,
                lang: userLang
            })

            setAccessToken(res.data.accessToken);
            localStorage.setItem("userLoggedIn", "true");

            if (register.data && register.data.userInfo) {
                setLoading(false);
                setShowModal(null);
                setUser(register.data.userInfo);
                localStorage.setItem("userLoggedIn", "true");
                if (location.pathname.includes('/login')) {
                    navigate('/');
                }
            }   

        } catch (err) {
            console.error("Login failed:", err);
            throw err;
        }
    }

    const fieldOnChange = (e, field) => {
        setAccount({...account, [field]: e.target.value});
        e.target.value && setError({case: null, message: ''});
    }

    const onLogin = () => {
        location.pathname.includes('register') ? navigate('/login') : setShowModal('login')
    }

    const onVerifySuccess = () => {
        setShowOtpBox(false);
        setVerified(true);
        onRegister();
    }

    const onResend = () => {
        setCanResend(false);
        handleVerifyEmail();
    }

    const onChangeEmail = () => {
        setShowOtpBox(false);
        setVerified(false);
        setCanResend(false);
    }
    return <div className={classNames(styles.login, {[styles.page]: location.pathname.includes('register')})}>
        <div className={styles.register}>
            <h1>Email OTP</h1>
            {
                !verified && !showOtpBox &&
                <>
                    <div className={error && error.case === 1 ? styles.errorInput : ''}>
                        <input type='text' placeholder='Email' value={account.email} onBlur={handleBlurEmail} onChange={e => fieldOnChange(e, 'email')} />
                        <MdEmail />
                    </div>
                    <div className={styles.rightAlign}>
                        <Checkbox 
                            label="Got a referrer (new user only)"
                            isChecked={showReferer}
                            setIsChecked={setShowReferrer}
                            isDisabled={!emailAvailable}
                        />
                    </div>
                    {
                        showReferer &&
                        <ReferrerInput setData={setAccount} emailAvailable={emailAvailable} />
                    }
                    
                    <div className='buttons'>
                        <button onClick={handleVerifyEmail} className={loading ? 'btn loading' : 'btn'}>
                            <span>
                            {
                                loading ? 
                                <>
                                    <Loader isSmall/>
                                    {' Email is sending ...'}
                                </> : 'Send OTP to my email'
                            }
                            </span>
                        </button>
                        
                    </div>
                    
                </>
            }
            {
                showOtpBox &&
                <>
                    <p>An email with a verification code was just sent to <b>{account.email}</b>, <br /> This code is valid for 5 minutes.
                    </p>
                    <VerifyOtp email={account.email} onSuccess={onVerifySuccess} />
                    <p>Don't see any email?{" "}
                        {canResend ? (
                            <strong onClick={onResend}>Resend Now</strong>
                            ) : (
                                <>
                                Resend verification code in <CountdownTimer duration={60} onComplete={() => setCanResend(true)} />
                                </>
                        )} or <strong onClick={onChangeEmail}>Change to another email</strong>
                    </p>
                </>
            }
            
            <p className={styles.center}>Already has an account? <strong onClick={onLogin}>Login</strong></p>
        </div>
    </div>
}

export default Register;