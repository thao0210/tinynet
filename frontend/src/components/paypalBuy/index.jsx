import { PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import { useStore } from '@/store/useStore';
import urls from '@/sharedConstants/urls';
import toast from 'react-hot-toast';
import { emitter } from '@/services/events';

export default function PayPalBuy({ selectedPackage, onSuccess }) {
  const {user, setUser} = useStore();
  const userId = user._id;

  return (
    <PayPalButtons
      createOrder={async () => {
        const res = await axios.post(urls.PAYPAL_CREAT_ORDER, {
          packageId: selectedPackage.id,
          userId,
        });
        return res.data.id;
      }}
      onApprove={async (data) => {
        try {
          const res = await axios.post(`${urls.PAYPAL_CAPTURE_ORDER}/${data.orderID}`);
          toast.success(`Payment successful! You received +${res.data.points} stars ✨`);
          const change = res.data?.pointsChange;
          if (change > 50) {
            emitter.emit("changePoints", change);
          }
          setUser(prev => ({
            ...prev,
            userPoints: prev.userPoints + (res.data?.points || 0)
          }));

          onSuccess?.(); // Optional callback after successful purchase
        } catch (err) {
          console.error("❌ PayPal capture error:", err);
          toast.error("Something went wrong after payment.");
        }
      }}
      onError={(err) => {
        console.error("❌ PayPal error:", err);
        toast.error("Payment failed. Please try again.");
      }}
    />
  );
}
