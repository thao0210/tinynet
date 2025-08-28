import { useState } from 'react';
import classes from './styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const ChangePassword = () => {
    const [showNewPassText, setShowNewPassText] = useState(false);
    const [showPassText, setShowPassText] = useState(false);
    const [showConfirmPassText, setShowConfirmPassText] = useState(false);
    const {user} = useStore();
    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    });

    const onShowPass = () => {
        setShowPassText(!showPassText);
    }

    const onShowConfirmPass = () => {
        setShowConfirmPassText(!showConfirmPassText);
    }

    const isDisabled = () => {
        if (((user.hasPass && password.currentPassword) || !user.hasPass) && password.newPassword && password.newPasswordConfirm) return false;
        return true;
    }

    const onChange = async () => {
        if (password.currentPassword && password.newPassword === password.currentPassword) {
            toast.error('New password should be different from current password!')
            return ;
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!strongPasswordRegex.test(password.newPassword)) {
            toast.error('Password at least 8 characters, mixing uppercase and lowercase letters, numbers, and symbols');
            return ;
        }
        // if (password.newPassword.)
        if (password.newPasswordConfirm !== password.newPassword) {
            toast.error('New password confirmation should be same as new password!')
            return ;
        }

        const changePass = await api.put(urls.UPDATE_PASSWORD, {
            oldPassword: password.currentPassword,
            newPassword: password.newPassword
        })

        if (changePass.data) {
            toast.success('Password is updated successfully!');
        }
    }

    const fieldOnchange = (e, type) => {
        setPassword({...password, [type]: e.target.value});
    }
    return (
        <div className={classes.form}>
            <div>
                <label>Current Password</label>
                <div className='input-with-icon'>
                    <input disabled={user && !user.hasPass} type='password' autoComplete='new-password' onChange={e => fieldOnchange(e, 'currentPassword')} />
                    {
                        user.hasPass &&
                        <span onClick={() => setShowPassText(!showPassText)}>
                            {
                                showPassText ? 
                                <MdVisibilityOff /> :
                                <MdVisibility />
                            }
                        </span>
                    }
                </div>
            </div>
            <div>
                <label>New Password</label>
                <div className='input-with-icon'>
                    <input type={showNewPassText ? 'text' : 'password'} onChange={e => fieldOnchange(e, 'newPassword')} />
                    <span onClick={() => setShowNewPassText(!showNewPassText)}>
                        {
                            showNewPassText ? 
                            <MdVisibilityOff /> :
                            <MdVisibility />
                        }
                    </span>
                </div>
                
            </div>
            <div>
                <label>New Password Confirmation</label>
                <div className='input-with-icon'>
                    <input type={showConfirmPassText ? 'text' : 'password'} onChange={e => fieldOnchange(e, 'newPasswordConfirm')} />
                    <span onClick={() => setShowConfirmPassText(!showConfirmPassText)}>
                        {
                            showConfirmPassText ? 
                            <MdVisibilityOff /> :
                            <MdVisibility />
                        }
                    </span>
                </div>
                
            </div>
            <div>
                <button className='btn sm' onClick={onChange} disabled={isDisabled()}>Update</button>
            </div>
        </div>
    )
}

export default ChangePassword;