// hooks/useUpdateUserPoints.js
import api from '@/services/api';
import urls from '@/sharedConstants/urls';

export const useUpdateUserPoints = () => {
  const updateScore = async (points, description = '') => {
    try {
     console.log('abc');
      const res = await api.post(urls.UPDATE_USERPOINTS, { points, description });
      return res.data;
    } catch (err) {
      console.error("Update user points failed:", err);
      return null;
    }
  };

  return updateScore;
};
