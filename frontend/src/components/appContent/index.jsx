import Login from '@/views/login';
import Register from '@/views/login/register';
import ForgotPass from '@/views/login/forgotPass';
import NewItem from '@/views/list/newItem';
import ViewItem from '@/views/list/viewItem';
import Profile from '@/views/profile';
import Champions from '@/views/champion';
import Games from '@/views/games';
import AboutUs from '@/views/aboutUs';
import TermsPrivacy from '@/views/aboutUs/terms';
import ContactUs from '@/views/aboutUs/contactForm';
import DonationMethods from '@/views/aboutUs/donationMethods';
import { InputOTP, InputPassword } from '@/views/list/list-components';
import { Routes, Route } from 'react-router-dom';
import List from '@/views/list';
import classes from './styles.module.scss';
import { useState } from 'react';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';
import DataDeletion from '@/views/aboutUs/dataDeletion';
import AuthSuccess from '@/views/authSuccess';

const ReportForm = ({showModal, setShowModal}) => {
    const [reason, setReason] = useState('');
    const onSubmit = async () => {
        const arr = showModal.split('-');
            if (arr.length > 2) {
                try {
                    const res = await api.post(`${showModal.includes('item') ? urls.REPORT_ITEM : urls.REPORT_COMMENT}/${arr[2]}`, 
                    {reason}
                   );
                   if (res.data) {
                    toast.success(res.data?.message);
                    setShowModal('');
                   }
                } catch (err) {
                    console.error('Failed to fetch reports', err);
                }
            }
        
    }
    return (
        <div className={classes.reportForm}>
            <h2>Report this {showModal.includes('item') ? 'item' : 'comment'}</h2>
            <p className='note'>Reason should be at least 50 characters</p>
            <div>
                <label>Reason</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div>
                <button className="btn" onClick={onSubmit} disabled={!(reason && reason.length > 5)}>Submit</button>
            </div>
        </div>
    )
}
export default function AppModalContent({ showModal, nextModal, setShowModal }) {
  if (showModal === 'login') return <Login nextModal={nextModal} />;
  if (showModal === 'register') return <Register />;
  if (showModal === 'forgotPass') return <ForgotPass />;
  if (showModal.includes('newItem')) return <NewItem />;
  if (showModal.includes('itemPassword')) return <InputPassword />;
  if (showModal.includes('itemOtp')) return <InputOTP />;
  if (showModal === 'champions') return <Champions />;
  if (showModal === 'games') return <Games />;
  if (showModal === 'aboutUs') return <AboutUs />;
  if (showModal === 'terms') return <TermsPrivacy />;
  if (showModal === 'contactUs') return <ContactUs />;
  if (showModal === 'donateMethod') return <DonationMethods />;
  if (showModal.includes('report')) return <ReportForm showModal={showModal} setShowModal={setShowModal} />;

  return null;
}

export const modalConfig = {
  login: { width: 400 },
  register: { width: 400 },
  forgotPass: { width: 400 },
  itemPassword: { width: 400 },
  itemOtp: { width: 400 },
  viewItem: { isFull: true },
  newItem: { isFull: true },
  profile: { isFull: true },
  champions: { width: 800 },
  games: { width: 530 },
  aboutUs: { width: 750 },
  terms: { width: 600 },
  contactUs: { width: 600 },
  donateMethod: { width: 1000 },
  report: { width: 500}
};

export function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<List />} />
      <Route path='list' element={<List />} />
      <Route path='login' element={<Login />} />
      <Route path='register' element={<Register />} />
      <Route path='post/:id' element={<ViewItem />} />
      <Route path='profile/:userId' element={<Profile />} />
      <Route path='terms-and-privacy' element={<TermsPrivacy />} />
      <Route path='data-deletion' element={<DataDeletion />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
    </Routes>
  );
}
