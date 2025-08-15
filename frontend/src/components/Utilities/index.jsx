import Tippy from "@tippyjs/react"
import { FaRegQuestionCircle } from "react-icons/fa"
import 'tippy.js/dist/tippy.css'; // css của tippy
import classes from './styles.module.scss';
import { numberWithCommas } from "@/utils/numbers";
import classNames from "classnames";
import { useEffect, useState, useRef } from "react";

const Tooltip = ({content}) => {
    return (
        <Tippy content={content}>
            <span className={classes.info}>
                <FaRegQuestionCircle size={16} />
            </span>
        </Tippy>
    )
}

export const StarPoints = ({points, size, isCost, isActive, onClick}) => {
    return (
        <span className={classNames(classes.star, {[classes.cost]: isCost, [classes.active]: isActive})} onClick={onClick}>
            {numberWithCommas(points)} 
            <img src={'/star.webp'} height={size} />
        </span>
    )
}
export const UsageControl = ({
  points,
  usePoint,
  setUsePoint,
  isChecked,
  isEdit = false,
}) => {
  const [hasAddedPoints, setHasAddedPoints] = useState(false);

  // Chốt trạng thái "đã từng mua" ngay lúc vào edit
  const initialCheckedRef = useRef(isChecked);
  const isPreviouslyPurchased = isEdit && initialCheckedRef.current === true;

  // Đồng bộ theo checkbox (bỏ qua hoàn toàn nếu đã từng mua trong edit)
  useEffect(() => {
    if (isPreviouslyPurchased) return;

    if (isChecked && !hasAddedPoints) {
      setUsePoint((prev) => prev + points);
      setHasAddedPoints(true);
    } else if (!isChecked && hasAddedPoints) {
      setUsePoint((prev) => prev - points);
      setHasAddedPoints(false);
    }
  }, [isChecked, isPreviouslyPurchased, hasAddedPoints, points]);

  const onSpendPoint = (e) => {
    e.stopPropagation();
    // Không cho click cộng nếu đã từng mua trong edit, hoặc đã cộng rồi, hoặc chưa check
    if (isPreviouslyPurchased || hasAddedPoints || !isChecked) return;

    setUsePoint((prev) => prev + points);
    setHasAddedPoints(true);
  };

  return (
    <StarPoints
      onClick={onSpendPoint}
      isCost
      points={points}
      size={20}
      // Hiển thị active nếu: đã từng mua (edit) HOẶC vừa chọn mua trong phiên này
      isActive={isPreviouslyPurchased || hasAddedPoints}
    />
  );
};

export default Tooltip;