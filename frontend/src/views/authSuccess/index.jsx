import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { setAccessToken } from "@/services/api";
import urls from '@/sharedConstants/urls'
import { useStore } from "@/store/useStore";

export default function AuthSuccess() {
  const { setUser, setPointsChange } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pChange = Number(params.get("pointsChange")) || 0;
    const accessToken = params.get("accessToken") || null;
    setPointsChange(pChange);
    const fetchUser = async () => {
      try {
        if (accessToken) {
          setAccessToken(accessToken); // 🟢 gắn token vào memory
          localStorage.setItem("userLoggedIn", "true");
        }

        const res = await api.get(urls.CHECK_AUTH);
        setUser(res.data.user);

        const redirectUrl = localStorage.getItem("redirectUrl") || "/list";
        localStorage.removeItem("redirectUrl");
        navigate(redirectUrl);

      } catch (err) {
        console.error("AuthSuccess error:", err);
        navigate("/login");
      }
    };
    fetchUser();
  }, []);

  
  return <div>Loging in, please wait...</div>;
}
