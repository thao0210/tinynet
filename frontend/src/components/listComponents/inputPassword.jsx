import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import classes from './styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { LoadingDots } from '@/components/loader';

export const InputPassword = () => {
    const {showModal, setShowModal, user, setLoadViewContent} = useStore();
    const [password, setPassword] = useState('');
    const [sendingOTP, setSendOTP] = useState(false);
    const [hint, setHint] = useState('');
    const [itemId, setItemId] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        const arr = showModal.split('-');
        if (arr.length > 1){
            setItemId(arr[1]);
            const _hint = arr.length > 2 ? arr[2] : '';
            _hint && setHint(_hint);
        }
    }, []);
    
    const onSave = async () => {
        const checkPassApi = await api.post(`${urls.LIST}/${itemId}/check-password`, {
            itemId,
            password
        });
        if (checkPassApi.data) {
            if (checkPassApi.data.requiresOtp) {
                if (!user) {
                    toast.error('To view this post also need OTP.');
                    toast.error('Please login to receive the OTP then try again!');
                    setShowModal('login');
                    return;
                }
                setSendOTP(true);
                const sendOtp = await api.post(`api/send-otp`, {email: user.email});
                if (sendOtp.data) {
                    setSendOTP(false);
                    toast.success('Please check your email to input OTP');
                    setShowModal('itemOtp-'+itemId);
                }
            } else {
                const path = window.location.pathname;
                setShowModal(null);
                if (path.includes('post')) {
                    setLoadViewContent(true);
                } else {
                    navigate('/post/'+itemId);
                }
            }
        }
    }

    return (
        <div className={classes.addPassword}>
            <label>Post's password</label>
            <input type='password' autoComplete='new-password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} />
            {
                hint &&
                <div className={classes.hint}>
                    <span onClick={() => setShowHint(!showHint)}>{showHint ? 'Hide ': 'View '}hint</span>
                    {
                        showHint &&
                        <div>{hint}</div>
                    }
                </div>
            }
            <div className='buttons'>
                <button onClick={onSave} disabled={!itemId || !password || sendingOTP} className={sendingOTP ? 'btn btn-loading' : 'btn'}>Save {sendingOTP && <LoadingDots />}</button>
                <button className='btn sub' onClick={() => setShowModal(false)}>Cancel</button>
            </div>
        </div>
    )
}