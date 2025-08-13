import { useEffect, useRef, useState } from 'react';

export const usePointCalculator = (data, setData, promotionData, radioListMap = {}) => {
    const promotePointRef = useRef(0);
    const [usePoint, setUsePoint] = useState(0);

    // Xử lý cộng/trừ điểm khi chọn promote
    useEffect(() => {
        if (data.isPromoted) {
            const item = promotionData.find(i => i.value === data.promoteDuration);
            const points = item?.points || 0;

            if (points !== promotePointRef.current) {
                setUsePoint(prev => prev - promotePointRef.current + points);
                promotePointRef.current = points;
            }
        } else {
            setUsePoint(prev => prev - promotePointRef.current);
            promotePointRef.current = 0;

            if (data.promoteDuration !== '') {
                setData(prev => ({ ...prev, promoteDuration: '' }));
            }
        }
    }, [data.isPromoted, data.promoteDuration]);

    // Xử lý các radio list khác (nếu có)
    useEffect(() => {
        let totalRadioPoints = 0;

        for (const [field, list] of Object.entries(radioListMap)) {
            const item = list.find(i => i.value === data[field]);
            if (item?.points) totalRadioPoints += item.points;
        }

        setUsePoint(prev => {
            const promotePoints = promotePointRef.current;
            return promotePoints + totalRadioPoints;
        });
    }, [data, radioListMap]);

    return { usePoint };
};
