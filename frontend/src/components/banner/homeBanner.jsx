import classes from './styles.module.scss';
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useStore } from '@/store/useStore';
import { BannerIntro, BannerIntro2 } from '@/components/banner';
import classNames from 'classnames';

const HomeBanner = ({onClose}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const {setShowModal} = useStore();
    const intervalRef = useRef(null);

    const startInterval = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setActiveIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
        }, 6000);
      };
    
    useEffect(() => {
        startInterval(); // bắt đầu khi mount

        return () => clearInterval(intervalRef.current); // clear khi unmount
      }, []);

    const handleMouseEnter = () => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current); // tạm dừng khi hover
    }
    };

    const handleMouseLeave = () => {
    startInterval(); // chạy lại khi rời chuột
    };
    const variants = {
        initial: {
            opacity: 0,
            clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
        },
        animate: {
            opacity: 1,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
            transition: { duration: 1 },
        },
        exit: {
            opacity: 0,
            clipPath: "polygon(10% 10%, 90% 0, 100% 90%, 0 100%)",
            transition: { duration: 1 },
        },
    };
    return (
        <div className={classes.introduction}>
            <button className={classes.close} onClick={onClose}>&times;</button>
            <div 
                className={classes.banner} 
                onClick={() => {
                    onClose && onClose();
                    setShowModal('login');
                }} 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <AnimatePresence mode="wait">
                {activeIndex === 0 && (
                    <div className={classes.banner2}>
                        <motion.div
                            key="banner1"
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <BannerIntro2 />
                        </motion.div>
                    </div>
                )}

                {activeIndex === 1 && (
                    <div className={classes.banner1}>
                        <motion.div
                            key="banner2"
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <BannerIntro />
                        </motion.div>
                    </div>
                )}
                </AnimatePresence>
            </div>
        </div>  
    )
}

export default HomeBanner;