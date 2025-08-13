import { useEffect, useState } from 'react';
import {
  BrowserRouter
} from "react-router-dom";
import './App.css';
import { useStore } from '@/store/useStore';
import api from '@/services/api';
import urls from '@/sharedConstants/urls';
import Modal from '@/components/modal';
import {Toaster} from 'react-hot-toast';
import CongratsBanner from './components/banner';
import { emitter } from "./services/events";
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import AppModalContent, { AppRoutes, modalConfig } from './components/appContent';

  function App() {
    const {setUser, user, showModal, setShowModal} = useStore();
    const [points, setPoints] = useState(null);
    const [nextModal, setNextModal] = useState(null);
    const config = showModal && Object.entries(modalConfig).find(([key]) => showModal.includes(key))?.[1] || {};

    useEffect(() => {
      user && user.username && showModal=== 'login' && setShowModal('');
    }, [user]);

  useEffect(() => {
  let hasCheckedAuth = false;

  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  localStorage.setItem("timezone", browserTimezone);

  const checkAuth = async () => {
    try {
      const res = await api.get(urls.CHECK_AUTH);
      setUser(res.data.user);
      localStorage.setItem("userLoggedIn", "true");
      hasCheckedAuth = true;
    } catch (error) {
      setUser(null);
      localStorage.removeItem("userLoggedIn");
      console.warn("⚠️ User chưa đăng nhập hoặc phiên hết hạn.");
    }
  };

  const refreshAccessToken = async () => {
    try {
      await api.post(urls.REFRESH_TOKEN);
      console.log("🔄 Access Token đã được refresh!");
      await checkAuth();
    } catch (error) {
      console.warn("🔴 Refresh token hết hạn, cần đăng nhập lại.");
      setUser(null);
      localStorage.removeItem("userLoggedIn");
    }
  };

  const init = async () => {
    try {
      await checkAuth();
    } catch (err) {
      if (!hasCheckedAuth) {
        await refreshAccessToken(); // chỉ refresh nếu checkAuth chưa từng thành công
      }
    }
  };

  init();

  // Emitter setup
  const handleChangePoints = (value) => setPoints(value);

  const handleRequireLogin = ({ redirectUrl, nextStep }) => {
    const nextModal = nextStep.requirePassword
      ? "itemPassword-" + nextStep.itemId
      : nextStep.requireOtp
      ? "itemOtp-" + nextStep.itemId
      : "";
    if (nextModal) setNextModal(nextModal);
    setShowModal("login");
  };

  const handleRequireItemAuth = ({ requirePassword, requireOtp, itemId }) => {
    const modal = requirePassword
      ? "itemPassword-" + itemId
      : requireOtp
      ? "itemOtp-" + itemId
      : "";
    const nextModal = requirePassword && requireOtp ? "itemOtp-" + itemId : "";
    if (nextModal) setNextModal(nextModal);
    setShowModal(modal);
  };

  emitter.on("changePoints", handleChangePoints);
  emitter.on("requireLogin", handleRequireLogin);
  emitter.on("requireItemAuth", handleRequireItemAuth);

  return () => {
    emitter.off("changePoints", handleChangePoints);
    emitter.off("requireLogin", handleRequireLogin);
    emitter.off("requireItemAuth", handleRequireItemAuth);
  };
}, []);

  return (
    <PayPalScriptProvider options={{ 'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
    <BrowserRouter>
      <div className='app'>
        <AppRoutes />
        {
            showModal &&
            <Modal setShowModal={setShowModal} width={config.width || 880} height={'auto'} isFull={config.isFull || false}>
                <AppModalContent showModal={showModal} nextModal={nextModal} setShowModal={setShowModal} />
            </Modal>
        }
        <Toaster containerStyle={{ zIndex: 99999 }}/>
        {points !== null && (
          <CongratsBanner
            visible={points}
            points={points}
            time={4}
            onClose={() => setPoints(null)}
          />
        )}
      </div>
    </BrowserRouter>
    </PayPalScriptProvider>
  )
}

export default App;
