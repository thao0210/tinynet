import { useState, useEffect } from "react";
import api from '@/services/api';
import urls from '@/sharedConstants/urls';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import classes from './styles.module.scss';
import Loader from '@/components/loader';

const ContactUs = () => {
    const [data, setData] = useState({
        email: '',
        content: ''
    });
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const {user, setShowModal, loading, setLoading} = useStore();

    const emailOnChange = (e) => {
        setData({...data, email: e.target.value});
    }

    const contentOnChange = (e) => {
        setData({...data, content: e.target.value});
    }

    const onSend = async () => {
        if (!data.email.toLowerCase().match(emailRegex)) {
            console.log('error');
            toast.error('Email is not valid');
            return;
        }
        setLoading(true);
        try {
            const postContact = await api.post(urls.CONTACT, {email: data.email, content: data.content});
            if (postContact.data) {
                toast.success('Thank you! We’ve received your message and will get back to you as soon as possible.')
                setShowModal(null);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user && user.email) {
            setData({...data, email: user.email});
        }
    }, []);

    return (
        <div className={classes.form}>
            <h2>Contact Us</h2>
            <div>
                <label>Email</label>
                <input type="text" value={data.email} onChange={emailOnChange} />
            </div>
            <div>
                <label>Content</label>
                <textarea value={data.content} onChange={contentOnChange} />
            </div>
            <div>
                <button onClick={onSend} disabled={!data.email || !data.content} className={loading ? 'btn loading' : 'btn'}>
                    <span>
                        {
                            loading ? 
                            <>
                                <Loader isSmall/>
                                {' sending ...'}
                            </> : 'Send'
                        }
                    </span>
                </button>
            </div>
        </div>
    )
}

export default ContactUs;