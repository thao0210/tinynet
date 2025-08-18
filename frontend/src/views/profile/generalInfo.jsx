import urls from "@/sharedConstants/urls";
import classes from './styles.module.scss';
import { useStore } from "@/store/useStore";
import api from '@/services/api';
import toast from "react-hot-toast";
import { useState } from "react";
import { MdEdit } from 'react-icons/md';
import DateTimePicker from '@/components/timepicker';
import { format } from 'date-fns';
import Dropdown from "@/components/dropdown";
import LANGUAGES from "@/sharedConstants/languages";
import { getFlag } from "@/utils/lang";

const GeneralInformation = ({userInfo, setUserInfo, isMyProfile}) => {
    const {user, setUser, setLoadList} = useStore();
    const [editProfile, setEditProfile] = useState(false);

    const info = (text) => {
        return text ? text : 'N/A';
    }
    const fieldOnChange = (e, type, value) => {
        if ((type === 'dob' || type ==='lang') && value) {
            setUser(prev => ({...prev, [type]: value}))
        } else {
            setUser(prev => ({...prev, [type]: e.target.value}));
        }
    }

    const onChange = async () => {
        const updateUser = await api.put(urls.UPDATE_USER, user);
        if (updateUser.data) {
            toast.success('Your profile has been updated');
            setEditProfile(false);
            setLoadList(true);
            setUserInfo(user);
        }   
    }

    return (
        <>
        {
            userInfo && !editProfile &&
            <div className={classes.info}>
                {
                    userInfo?._id === user?._id &&
                    <MdEdit className={classes.edit} onClick={() => setEditProfile(true)} title='Edit profile' />
                }
                <ul className={isMyProfile ? classes.myProfile : ''}>
                    <li>
                        <label>Name</label>
                        <strong>{info(userInfo.fullName)}</strong>
                    </li>
                    {
                        isMyProfile &&
                        <>
                            <li>
                                <label>UserName</label>
                                <strong>{userInfo.username}</strong>
                            </li>
                            <li>
                                <label>Email</label>
                                <strong>{userInfo.email}</strong>
                            </li>
                            <li>
                                <label>Phone</label>
                                <strong>{info(userInfo.phone)}</strong>
                            </li>
                            <li>
                                <label>Date of birth</label>
                                <strong>{info(userInfo.dob && format(new Date(userInfo.dob), 'dd/MM/yyyy'))}</strong>
                            </li>
                            <li>
                                <label>Occupation</label>
                                <strong>{info(userInfo.occupation)}</strong>
                            </li>
                            <li>
                                <label>Primary language</label>
                                <strong>{getFlag(userInfo.lang || navigator.language || 'en-US')}</strong>
                            </li>
                        </>
                    }
                    
                    <li>
                        <label>Number of posts</label>
                        <strong>{userInfo.noOfPosts}</strong>
                    </li>
                    <li>
                        <label>Number of comments</label>
                        <strong>{userInfo.noOfComments}</strong>
                    </li>
                    <li>
                        <label>Number of followers</label>
                        <strong>{userInfo.noOfFollowers}</strong>
                    </li>
                    <li>
                        <label>Following</label>
                        <strong>{userInfo.noOfFollowings}</strong>
                    </li>
                </ul>
            </div>
        }
        {
            userInfo && editProfile &&
            <div className={classes.form}>
                <div>
                    <label>Name</label>
                    <input type='text' value={user?.fullName||''} onChange={e => fieldOnChange(e, 'fullName')} />
                </div>
                <div>
                    <label>Phone</label>
                    <input type='text' value={user?.phone||''} onChange={e => fieldOnChange(e, 'phone')} />
                </div>
                <div>
                    <label>Occupation</label>
                    <input type='text' value={user?.occupation||''} onChange={e => fieldOnChange(e, 'occupation')} />
                </div>
                <div>
                    <DateTimePicker
                        value={user?.dob||''}
                        onChange={() => fieldOnChange(null, 'dob', format(new Date(), 'yyyy-MM-dd'))}
                        label="Date of Birth"
                        field='dob'
                    />
                </div>
                <div>
                    <label>Primary language</label>
                    <Dropdown
                        curValue={user?.lang}
                        list={LANGUAGES}
                        onSelect={(selected) => fieldOnChange(null, 'lang', selected.value)}
                        label={"Language"}
                        width={'400px'}
                        returnObj={true}
                        dropdownContainerSelector='#profile'
                    />
                </div>  
                <div className="buttons">
                    <button className='btn sm' onClick={onChange} disabled={false}>Save</button>
                    <button className="btn sub" onClick={() => setEditProfile(false)}>Cancel</button>
                </div>
            </div>
        }
        </>
    )
}

export default GeneralInformation;