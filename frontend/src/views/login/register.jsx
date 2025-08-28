import { useState } from 'react';
import urls from '@/sharedConstants/urls';
import styles from './styles.module.scss';
import { useStore } from '@/store/useStore';
import classNames from 'classnames';
import { MdEmail, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import api from '@/services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import OtpInput from '@/components/otpInput';
import CountdownTimer from '@/components/countdown';
import Loader from '@/components/loader';
import toast from 'react-hot-toast';
import ReferrerInput from './referrerInput';

export const VerifyOtp = ({ email, onSuccess, itemId }) => {  
    const handleVerifyOtp = async (otp) => {
      const res = await api.post(itemId ? `${urls.LIST}/${itemId}/verify-otp` : urls.VERIFY_OTP, {email, otp})
      if (res.data) {
        res.data.tempToken ?  onSuccess(res.data.tempToken) : onSuccess();
    };
    }
  
    return (
      <div>
        <OtpInput length={6} onComplete={handleVerifyOtp} />
      </div>
    );
  };
  
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

    const [account, setAccount] = useState({
        email: '',
        referrer: ''
    })

    const handleVerifyEmail = async () => {
        if (!account.email.toLowerCase().match(emailRegex)) {
            toast.error('Email is required!')
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

    const onRegister = async (username) => {

        // create a random avatar
        const baseUrl = import.meta.env.VITE_R2_BASE_URL;
        const avatarUrl = `${baseUrl}/avatar/${Math.round(Math.random()*40)}.webp`;
        setLoading(true);
        const register = await api.post(urls.REGISTER, {
            username: username,
            // password: account.password,
            email: account.email,
            avatar: avatarUrl,
            referrer: account.referrer,
            timezone: userTimezone,
            lang: userLang
        })

        if (register.data && register.data.userInfo) {
            setLoading(false);
            setShowModal(null);
            setUser(register.data.userInfo);
            localStorage.setItem("userLoggedIn", "true");
            if (location.pathname.includes('/login')) {
                navigate('/');
            }
        }   
    }

    const fieldOnChange = (e, field) => {
        setAccount({...account, [field]: e.target.value});
        e.target.value && setError({case: null, message: ''});
    }

    const onkeyRegister = (e) => {
        if (e.key === 'Enter') {
            onRegister();
        }
    }

    const onLogin = () => {
        location.pathname.includes('register') ? navigate('/login') : setShowModal('login')
    }

    const onVerifySuccess = () => {
        setShowOtpBox(false);
        setVerified(true);
        onRegister(account.email.split('@')[0]);
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
            <h1>Sign Up</h1>
            {
                !verified && !showOtpBox &&
                <>
                    <div className={error && error.case === 1 ? styles.errorInput : ''}>
                        <input type='text' placeholder='Email' value={account.email} onChange={e => fieldOnChange(e, 'email')}
                            onKeyDown={onkeyRegister}
                        />
                        <MdEmail />
                    </div>
                    <div className={styles.rightAlign}>
                        <strong onClick={() => setShowReferrer(!showReferer)}>{showReferer ? 'Hide ' : 'Got '}a referrer?</strong>
                    </div>
                    {
                        showReferer &&
                        <ReferrerInput setData={setAccount} />
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
            {/* {
                verified &&
                <>
                    <div>
                        <input type='text' placeholder='Email' value={account.email} disabled/>
                        <MdEmail />
                    </div>
                    <div className={error && error.case === 2 ? styles.errorInput : ''}>
                        <input type='text' placeholder='Username' value={account.username} onChange={e => fieldOnChange(e, 'username')}/>
                        <MdPerson />
                        {
                            error && error.case === 2 &&
                            <span>{error.message}</span>
                        }
                    </div>
                    <div className={error && error.case === 3 ? styles.errorInput : ''}>
                        <input type={showPassText ? 'text' : 'password'} placeholder='Password' value={account.password} onChange={e => fieldOnChange(e, 'password')}/>
                        {
                            showPassText ? <MdVisibility onClick={onShowPass} /> : <MdVisibilityOff onClick={onShowPass} />
                        }
                        {
                            error && error.case === 3 &&
                            <span>{error.message}</span>
                        }
                    </div>
                    <div className={error && error.case === 4 ? styles.errorInput : ''}>
                        <input type={showConfirmPassText ? 'text' : 'password'} placeholder='Password Confirmation' value={account.passConfirm} onChange={e => fieldOnChange(e, 'passConfirm')}/>
                        {
                            showConfirmPassText ? <MdVisibility onClick={onShowConfirmPass}/> : <MdVisibilityOff onClick={onShowConfirmPass} />
                        }
                        {
                            error && error.case === 4 &&
                            <span>{error.message}</span>
                        }
                    </div>
                    <div>
                        <input  type='text' placeholder='referrer (if any)' onChange={e => fieldOnChange(e, 'referrer')}/>
                    </div>
                    
                    <div className='buttons'>
                        <button className="btn" onClick={onRegister} disabled={isDisabled()}>
                            <span>Register</span>
                        </button>
                    </div>
                </>
            } */}
            
            <p className={styles.center}>Already has an account? <strong onClick={onLogin}>Login</strong></p>
        </div>
    </div>
}

export default Register;