import {motion} from 'framer-motion';
import { useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import classes from './styles.module.scss';
import useClickOutside from '@/hooks/useClickOutsite';
import Tippy from '@tippyjs/react';
import {ITEM_TYPE} from '@/sharedConstants/data';

export const NewType = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {setShowModal, setCurItemId} = useStore();
    const listRef = useRef();
    useClickOutside(listRef, () => setIsOpen(false));
    const newItem = (type) => {
        setShowModal(`newItem-${type}`);
        setCurItemId('');
    }
    return (
        <div className={classes.newItem} ref={listRef}>
            <div onClick={() => setIsOpen(!isOpen)} className={isOpen ? classes.active : ''}>
                {
                    !isOpen && <Tippy content='Create new item'><span title='Create new item'>+</span></Tippy>
                }
                {
                    isOpen && <span className={classes.newBtn}>+</span>
                }
                {isOpen && (
                    <ul className={classes.typeslist}>
                    {
                        ITEM_TYPE.map((item, index) => {
                            const totalButtons = ITEM_TYPE.length;
                            const angle = (-Math.PI / 2.2) + (index / (totalButtons - 1)) * (Math.PI / 1.1);
                            const outerRadius = 120;
                            const innerRadius = 80;
                            const xOuter = Math.cos(angle) * outerRadius;
                            const yOuter = Math.sin(angle) * outerRadius;
                            const xInner = Math.cos(angle) * innerRadius;
                            const yInner = Math.sin(angle) * innerRadius;
                            const x = (xOuter + xInner) / 2;
                            const y = (yOuter + yInner) / 2;
                            return (
                                <motion.li
                                    key={index}
                                    initial={{ x: 0, y: 0, opacity: 0 }}
                                    animate={{ x: -x, y: -y, opacity: 1 }}
                                    exit={{ x: 0, y: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    onClick={() => {newItem(item); setIsOpen(false)}}
                                >
                                    <div style={{ transform: `rotate(${angle}rad) translate(0, -10px)` }}>
                                        {item}
                                    </div>
                                </motion.li>
                            )
                        })
                    }
                    </ul>
                )}
            </div>
        </div>
    )
}