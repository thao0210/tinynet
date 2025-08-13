import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classes from './styles.module.scss';
import classNames from 'classnames';

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={classNames(classes.accordion, {[classes.open]: isOpen})}>
      <div className={classes.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span className={classes.accordionIcon}>{isOpen ? '−' : '+'}</span>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={classes.accordionContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={classes.accordionInner}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
