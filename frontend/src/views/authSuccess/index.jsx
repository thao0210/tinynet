import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api"; // chỗ bạn gọi BE
import urls from '@/sharedConstants/urls'
import { useStore } from "@/store/useStore";

export default function AuthSuccess() {
  const { setUser, setPointsChange } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pChange = Number(params.get("pointsChange")) || 0;
    setPointsChange(pChange);
    const fetchUser = async () => {
      try {
        const res = await api.get(urls.CHECK_AUTH);
        setUser(res.data.user);
        localStorage.setItem("userLoggedIn", "true");
        navigate("/list"); // hoặc navigate tới trang trước đó
      } catch (err) {
        console.error("AuthSuccess error:", err);
        navigate("/login");
      }
    };
    fetchUser();
  }, []);

  
  return <div>Loging in, please wait...</div>;
}
