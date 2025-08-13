import Tippy from "@tippyjs/react"
import { FaRegQuestionCircle } from "react-icons/fa"
import 'tippy.js/dist/tippy.css'; // css của tippy
import classes from './styles.module.scss';
import { numberWithCommas } from "@/utils/numbers";
import classNames from "classnames";
import { useEffect, useState } from "react";

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

  // Reset khi bị uncheck
  useEffect(() => {
    if (!isEdit &&!isChecked && hasAddedPoints) {
      setUsePoint(prev => prev - points);
      setHasAddedPoints(false);
    }
  }, [isChecked]);

  // Auto cộng điểm khi được check
  useEffect(() => {
    if (!isEdit && isChecked && !hasAddedPoints) {
      setUsePoint(prev => prev + points);
      setHasAddedPoints(true);
    }
  }, [isChecked]);

  const onSpendPoint = (e) => {
    e.stopPropagation();
    if (isEdit || !isChecked || hasAddedPoints) return;

    setUsePoint(prev => prev + points);
    setHasAddedPoints(true);
  };

  return (
    <StarPoints
      onClick={onSpendPoint}
      isCost
      points={points}
      size={20}
      isActive={hasAddedPoints}
    />
  );
};

export default Tooltip;