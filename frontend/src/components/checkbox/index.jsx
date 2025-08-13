import { IoMdCheckboxOutline } from 'react-icons/io';
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import classes from './styles.module.scss';
import { UsageControl } from '../Utilities';
import Tippy from '@tippyjs/react';
import classNames from 'classnames';

const Checkbox = ({label, isChecked, setIsChecked, data, dataFieldName, points, setUsePoint, isEdit, tippy, isCombine}) => {
    const handleCheckboxClick = () => {
        if (data) {
            setIsChecked({...data, [dataFieldName]: !isChecked});
        } else {
            setIsChecked(!isChecked);
        }
    };

    return (
        <Tippy content={tippy} disabled={!tippy}>
        <div className={classNames(classes.checkbox, {[classes.combine] : isCombine})} onClick={handleCheckboxClick}>
            {isChecked ? <IoMdCheckboxOutline /> : <MdCheckBoxOutlineBlank />}
            <label>
                {label}
                {points && 
                    <UsageControl
                        points={points}
                        setUsePoint={setUsePoint}
                        isChecked={isChecked}
                        isEdit={isEdit}
                    />
                }
            </label>
        </div>
        </Tippy>
    );
};

export default Checkbox;