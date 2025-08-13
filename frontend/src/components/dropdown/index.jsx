import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './dropdown.module.scss';
import ListContent from './listContent';
import { IoMdArrowDropdown } from "react-icons/io";
import classNames from 'classnames';
import Tippy from '@tippyjs/react';

const Dropdown = ({ 
  trigger, children, className, offset = 4, list = null, isSound,
  dropdownContainerSelector = '.modal-content', curValue = null,
  onSelect = () => {}, width = 'max-content', returnObj = false, 
  name, showFont, stopPropagation, tippy = null, keepTrigger = false,
  disabled = false, isVoice, isSmallText, background
 }) => {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [maxHeight, setMaxHeight] = useState(null);

  const updatePosition = () => {
    const triggerEl = triggerRef.current;
    const dropdownEl = dropdownRef.current;
    if (!triggerEl || !dropdownEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const dropdownRect = dropdownEl.getBoundingClientRect();

    const margin = 8; // optional: margin to screen edge

    // Default: show below
    let top = triggerRect.bottom + offset;
    let left = triggerRect.left;
    let availableHeight = window.innerHeight - triggerRect.bottom - margin;

    // If not enough space below, try showing above
    if (top + dropdownRect.height > window.innerHeight) {
      const spaceAbove = triggerRect.top - margin;
      if (spaceAbove > availableHeight) {
        top = triggerRect.top - dropdownRect.height - offset;
        availableHeight = spaceAbove;
      }
    }

    // Fix right overflow
    if (left + dropdownRect.width > window.innerWidth) {
      left = window.innerWidth - dropdownRect.width - offset;
    }

    // Clamp left to minimum 0
    left = Math.max(0, left);

    setPosition({ top, left });
    setMaxHeight(availableHeight); // save for inline style
  };

  useEffect(() => {
    if (visible) {
      let raf1, timeoutId;

      // delay để DOM layout xong
      raf1 = requestAnimationFrame(() => {
        timeoutId = setTimeout(() => {
          updatePosition();
        }, 20);

        setTimeout(() => {
          updatePosition();
        }, 100);
      });

      const handleClickOutside = (e) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target) &&
          !triggerRef.current.contains(e.target)
        ) {
          setVisible(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', updatePosition);
        clearTimeout(timeoutId);
      };
    }
  }, [visible]);

  const isList = Array.isArray(list) && list.length > 0;

  const renderTrigger = () => {
    if (!isList || keepTrigger) return trigger;
    const current = list.find((item) =>
      typeof item === 'object' ? item.value === curValue : item === curValue
    );
    const label = typeof current === 'object' ? current?.label : current || 'Select ...';
    return (
      <span className={styles.triggerLabel} style={{fontSize: isSmallText ? '12px' : 'inherit'}}>
        {label}
        {
          isList && <IoMdArrowDropdown />
        }
      </span>
    );
  };
  const container = document.querySelector(dropdownContainerSelector) || document.body;

  return (
    <>
      <Tippy content={tippy} disabled={!tippy}>
      <div ref={triggerRef} onClick={() => setVisible(!visible)} className={classNames(className, {[styles.disabled]: disabled})} style={{width: isList ? width : 'auto'}}>
        {renderTrigger()}
      </div>
      </Tippy>
      {visible &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            className={classNames(styles.dropdown, {[styles.padding] : !isList})}
             onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
            style={{ 
              top: `${position.top}px`, 
              left: `${position.left}px`, 
              width,
              maxHeight: maxHeight > 300 ? 300 : maxHeight ? `${maxHeight}px` : undefined,
              overflowY: 'auto',
              background: background
            }}
          >
            {typeof children === 'function'
              ? children({ onClose: () => setVisible(false) })
              : children
            }
            {
              list && list.length > 0 &&
              <ListContent 
                list={list}
                isSound={isSound}
                curValue={curValue}
                onSelect={(val, name) => {
                  onSelect(val, name);
                  setVisible(false);
                }}
                returnObj={returnObj}
                name={name}
                showFont={showFont}
                isVoice={isVoice}
              />
            }
          </div>,
          container
        )}
    </>
  );
};

export default Dropdown;
