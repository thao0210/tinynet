import { useState } from 'react';
import classes from './styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';

const ChangePassword = () => {
    const {user} = useStore();
    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    });

    const isDisabled = () => {
        if (((user.hasPass && password.currentPassword) || !user.hasPass) && password.newPassword && password.newPasswordConfirm) return false;
        return true;
    }

    const onChange = async () => {
        if (password.newPassword === password.currentPassword) {
            toast.error('New password should be different from current password!')
            return ;
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
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
                <input disabled={user && !user.hasPass} type='password' autoComplete='new-password' onChange={e => fieldOnchange(e, 'currentPassword')} />
            </div>
            <div>
                <label>New Password</label>
                <input type='password' onChange={e => fieldOnchange(e, 'newPassword')} />
            </div>
            <div>
                <label>New Password Confirmation</label>
                <input type='password' onChange={e => fieldOnchange(e, 'newPasswordConfirm')} />
            </div>
            <div>
                <button className='btn sm' onClick={onChange} disabled={isDisabled()}>Update</button>
            </div>
        </div>
    )
}

export default ChangePassword;