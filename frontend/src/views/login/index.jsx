import { useState } from 'react';
import styles from './styles.module.scss';
import { IoMdCheckboxOutline } from 'react-icons/io';
import { MdCheckBoxOutlineBlank, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import urls from '@/sharedConstants/urls';
import { useStore } from '@/store/useStore';
import api from '@/services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames';

const Login = ({nextModal}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassText, setShowPassText] = useState(false);
    const {setUser, setShowModal} = useStore();

    const [account, setAccount] = useState({
        input: '',
        password: ''
    })
    const [isRememberMe, setIsRememberMe] = useState(true);

    const isDisabled = () => {
        if (account.input && account.password) return false;
        return true;
    }

    const onLogin = async () => {
        const login = await api.post(urls.LOGIN, {
                    input: account.input,
                    password: account.password,
                    rememberMe: isRememberMe ? true : false,
                });

        if (login.data && login.data.userInfo) {
            setUser(login.data.userInfo);
            localStorage.setItem("userLoggedIn", "true");
            nextModal && setShowModal(nextModal);
            if (location.pathname.includes('/login')) {
                navigate('/');
            }
        }        
    }

    const onkeyLogin = (e) => {
        if (e.key === 'Enter') {
            onLogin();
        }
    }

    const onShowPass = () => {
        setShowPassText(!showPassText);
    }

    const onRegister = () => {
        location.pathname.includes('login') ? navigate('/register') : setShowModal('register');
    }

    const googleLogin = () => {
        // Redirect to Google OAuth
        if (import.meta.env.VITE_GOOGLE_URL) {
            window.location.href = import.meta.env.VITE_GOOGLE_URL; 
        }
    }

    const facebookLogin = () => {
        if (import.meta.env.VITE_FACEBOOK_URL) {
            // Redirect to Facebook OAuth
            window.location.href = import.meta.env.VITE_FACEBOOK_URL; 
        }
    }
    return (
    <div className={classNames(styles.login, {[styles.page]: location.pathname.includes('login')})}>
        <div>
            <h1>Sign In</h1>
            <div>
                <input type='text' placeholder={'Email or username'} value={account.input} onChange={e => setAccount({...account, input: e.target.value})}/>
                <MdPerson />
            </div>
            <div>
                <input 
                    type={showPassText ? 'text' : 'password'} 
                    placeholder='Password'
                    value={account.password} 
                    onChange={e => setAccount({...account, password: e.target.value})}
                    onKeyDown={onkeyLogin}
                />
                {
                    showPassText ? <MdVisibility onClick={onShowPass} /> : <MdVisibilityOff onClick={onShowPass} />
                }
            </div>
            <div className={styles.subOptions}>
                <div onClick={() => setIsRememberMe(!isRememberMe)}>
                    {
                        isRememberMe ?
                        <IoMdCheckboxOutline/> :
                        <MdCheckBoxOutlineBlank />
                    }
                    <label>Remember me</label>
                </div>
                <strong onClick={() => setShowModal('forgotPass')}>Forgot password?</strong>
            </div>
            <div className='buttons'>
                <button className="btn" onClick={onLogin} disabled={isDisabled()}>
                    <span>Login</span>
                </button>
            </div>
            <div>
                <div className={styles.or}>or</div>
                <div className={styles.others}>
                    <span onClick={googleLogin} className='disabled'><img src='/google.svg' height={25} /> Google</span>
                    <span onClick={facebookLogin} className='disabled'><img src='/fb.svg' height={25} /> Facebook</span>
                </div>
            </div>
            <p className={styles.center}>Don't have an account? <strong onClick={onRegister}>Sign Up</strong> </p>
        </div>
    </div>
    )
}

export default Login;