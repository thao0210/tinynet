import { useState } from 'react';
import urls from '@/sharedConstants/urls';
import styles from './styles.module.scss';
import { useStore } from '@/store/useStore';
import api, { setAccessToken } from "@/services/api";
import { useNavigate, useLocation } from 'react-router-dom';
import CountdownTimer from '@/components/countdown';
import toast from 'react-hot-toast';
import VerifyOtp from '@/components/otpInput';
  
const OtpBox = ({setShowOtpBox, email}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {setUser, setLoading, setShowModal} = useStore();
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const [canResend, setCanResend] = useState(false);
    const userLang = navigator.language || navigator.userLanguage || 'en-US';
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const handleVerifyEmail = async () => {
        if (!email.toLowerCase().match(emailRegex)) {
            toast.error('Please provide right email format!')
            return;
        }
        setLoading(true);
        try {
        const sendOtp =  await api.post(urls.SEND_VERIFICATION_EMAIL, {email: email});
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

    const onRegister = async () => {
        try {
            // create a random avatar
            const baseUrl = import.meta.env.VITE_R2_BASE_URL;
            const avatarUrl = `${baseUrl}/avatar/${Math.round(Math.random()*40)}.webp`;
            setLoading(true);
            const register = await api.post(urls.REGISTER, {
                email: email,
                avatar: avatarUrl,
                timezone: userTimezone,
                lang: userLang
            })

            setAccessToken(register.data.accessToken);

            if (register.data && register.data.userInfo) {
                setLoading(false);
                setShowModal(null);
                setUser(register.data.userInfo);
                localStorage.setItem("userLoggedIn", "true");
                localStorage.setItem('hasAccount', "true");
                if (location.pathname.includes('/login')) {
                    navigate('/');
                }
            }   

        } catch (err) {
            console.error("Login failed:", err);
            throw err;
        }
    }

    const onVerifySuccess = () => {
        setShowOtpBox(false);
        onRegister();
    }

    const onResend = () => {
        setCanResend(false);
        handleVerifyEmail();
    }

    const onChangeEmail = () => {
        setShowOtpBox(false);
        setCanResend(false);
    }
    return <>
        <div className={styles.register}>
            <h1>Email OTP</h1>
            <p>An email with a verification code was just sent to <b>{email}</b>, <br /> This code is valid for 5 minutes.
            </p>
            <VerifyOtp email={email} onSuccess={onVerifySuccess} />
            <p>Don't see any email?{" "}
                {canResend ? (
                    <strong onClick={onResend}>Resend Now</strong>
                    ) : (
                        <>
                        Resend verification code in <CountdownTimer duration={60} onComplete={() => setCanResend(true)} />
                        </>
                )} or <strong onClick={onChangeEmail}>Change to another email</strong>
            </p>
        </div>
    </>
}

export default OtpBox;