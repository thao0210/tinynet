import { useState } from 'react';
import styles from './styles.module.scss';
import { IoMdCheckboxOutline } from 'react-icons/io';
import { MdCheckBoxOutlineBlank, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import urls from '@/sharedConstants/urls';
import { useStore } from '@/store/useStore';
import api, { setAccessToken } from "@/services/api";
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames';

const Upass = ({nextModal}) => {
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
        try {
            const login = await api.post(urls.LOGIN, {
                    input: account.input,
                    password: account.password,
                    rememberMe: isRememberMe ? true : false,
                });

            setAccessToken(login.data.accessToken);
            if (login.data && login.data.userInfo) {
                setUser(login.data.userInfo);
                localStorage.setItem("userLoggedIn", "true");
                nextModal && setShowModal(nextModal);
                if (location.pathname.includes('/login')) {
                    navigate('/');
                }
            }    

        } catch (err) {
            console.error("Upass failed:", err);
            throw err;
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

    return (
    <>
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
                <span>Sign In</span>
            </button>
        </div>
    </>
    )
}

export default Upass;