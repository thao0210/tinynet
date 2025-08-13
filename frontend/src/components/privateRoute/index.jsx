import { useStore } from '@/store/useStore';

const PrivateRoute = ({ children }) => {
    const { user, loading, setShowModal } = useStore();

    if (loading) return <p>Loading...</p>; // Hiển thị loading khi đang kiểm tra
    return user ? children : () => setShowModal('login');
};

export default PrivateRoute;
