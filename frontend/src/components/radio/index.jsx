import { MdOutlineRadioButtonUnchecked, MdOutlineRadioButtonChecked } from "react-icons/md";
import classes from './styles.module.scss';
import {StarPoints} from '@/components/Utilities';
import classNames from "classnames";
import { FaRegCircle, FaDotCircle } from "react-icons/fa";

const RadioList = ({ list, value, setValue, data, datafield, disabled, isVertical, setUsePoint, labelWidth = 'auto' }) => {
    const isObjectList = list.length > 0 && typeof list[0] === 'object';

    const getValue = (item) => isObjectList ? item.value : item;
    const getLabel = (item) => isObjectList ? item.label : item;
    const getPoints = (item) => isObjectList ? item.points : 0;

    const handleSelect = (item) => {
        const selectedValue = getValue(item);
        const newPoints = getPoints(item);
    
        if (data && datafield) {
            const prevSelectedItem = list.find(i => getValue(i) === data[datafield]);
            const prevPoints = prevSelectedItem ? getPoints(prevSelectedItem) : 0;
    
            setValue({ ...data, [datafield]: selectedValue });
            setUsePoint && setUsePoint(prev => prev - prevPoints + newPoints);
        } else {
            setValue(selectedValue);
        }
    };

    return (
        <ul className={classNames(classes.radioList, {[classes.vertical]: isVertical})}>
            {list && list.map((item, index) => {
                const itemValue = getValue(item);
                const itemLabel = getLabel(item);
                const itemPoints = getPoints(item);
                const isSelected = value === itemValue;

                return (
                    <li key={`radio${index}`} onClick={() => handleSelect(item)} className={disabled?.includes(index) ? classes.disabled : ''}>
                        {isSelected ? <MdOutlineRadioButtonChecked /> : <MdOutlineRadioButtonUnchecked />}
                        <label style={{width: labelWidth}}>
                            {itemLabel}
                            {itemPoints > 0 && <StarPoints isCost points={itemPoints} size={20} isActive={value === item.value} />}
                        </label>
                    </li>
                );
            })}
        </ul>
    );
};

export const SelectorIcon = ({ selected }) => {
  return selected ? <FaDotCircle size={18} /> : <FaRegCircle size={16} />;
};

export default RadioList;