import { useState } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import Loader from '@/components/loader';
import CountdownTimer from '@/components/countdown';
import { VerifyOtp } from './register';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';

const ForgotPass = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const [verified, setVerified] = useState(false);
    const [showOtpBox, setShowOtpBox] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [password, setPassword] = useState({
        newPassword: '',
        newPasswordConfirm: ''
    });
    const {setShowModal} = useStore();

    const isDisabled = () => {
        if (email && email.toLowerCase().match(emailRegex)) return false;
        return true;
    }

    const onGetPass = async () => {
        setLoading(true);
        try {
            const sendOtp = await api.post(urls.FORGOT_PASSWORD, {email});
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

    const onResetPass = async () => {
            const reset = await api.post(urls.RESET_PASSWORD, {email, tempToken, newPassword: password.newPassword});
            if (reset.data) {
                toast.success('Password has been reset, please log in again!');
                setShowModal('login');
            }
    }
    const onEmailChange = e => {
        setEmail(e.target.value);
        e.target.value && setError('');
    }

    const onkeyHandle = (e) => {
        if (e.key === 'Enter') {
            onGetPass();
        }
    }

    const onVerifySuccess = (tempToken) => {
        setShowOtpBox(false);
        setVerified(true);
        tempToken && setTempToken(tempToken);
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

    const fieldOnchange = (e, type) => {
        setPassword({...password, [type]: e.target.value});
    }

    return (
        <div className={styles.login}>
            {
                 !verified && !showOtpBox &&
                <div>
                    <label>Input your account email to reset password</label>
                    <div>
                        <input type='text' placeholder='Email' value={email} onChange={e => onEmailChange(e)}
                            onKeyDown={onkeyHandle}
                        />
                    </div>
                    {
                        error &&
                        <div className={classNames(styles.errors, styles.show)}>{error}</div>
                    }
                    <div className='buttons inline'>
                        <button onClick={onGetPass} disabled={isDisabled()} className={loading ? 'btn loading' : 'btn'}>
                            {
                                loading ? 
                                <>
                                    <Loader isSmall/>
                                    {' Email is sending ...'}
                                </> : 'Submit'
                            }
                        </button>
                    </div>
                </div>
            }
            {
                showOtpBox &&
                <div>
                    <p>An email with a OTP code was just sent to <b>{email}</b>, <br /> This code is valid for 5 minutes.</p>
                    <VerifyOtp email={email} onSuccess={onVerifySuccess} />
                    <p>Don't see any email?{" "}
                        {canResend ? (
                            <strong onClick={onResend}>Resend Now</strong>
                            ) : (
                                <>
                                Resend OTP code in <CountdownTimer duration={60} onComplete={() => setCanResend(true)} />
                                </>
                        )} or <strong onClick={onChangeEmail}>Change to another email</strong>
                    </p>
                </div>
            }
            {
                verified &&
                <div className={styles.resetPass}>
                    <div>
                        <label>New Password</label>
                        <input type='password' onChange={e => fieldOnchange(e, 'newPassword')} />
                    </div>
                    <div>
                        <label>New Password Confirmation</label>
                        <input type='password' onChange={e => fieldOnchange(e, 'newPasswordConfirm')} />
                    </div>
                    <div>
                        <button className='btn sm' onClick={onResetPass} disabled={!password.newPassword || !password.newPasswordConfirm || password.newPassword !== password.newPasswordConfirm}>Reset password</button>
                    </div>
                </div>
            }
        </div>
    )
}

export default ForgotPass;