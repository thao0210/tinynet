import urls from '@/sharedConstants/urls';
import { useStore } from '@/store/useStore';
import { MdEmail} from 'react-icons/md';
import api from "@/services/api";
import Loader from '@/components/loader';
import toast from 'react-hot-toast';
  
const EmailOtp = ({setShowOtpBox, email, setEmail}) => {
    const {setLoading, loading} = useStore();
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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
            }
        } catch(error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return <>
            <h1>Email OTP</h1>
            <div>
                <input type='text' placeholder='Email' value={email || ''} onChange={e => setEmail(e.target.value)} />
                <MdEmail />
            </div>            
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

export default EmailOtp;