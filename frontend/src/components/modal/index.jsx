import React, {useRef} from 'react';
import classes from './modal.module.scss';
import classNames from 'classnames';
import ReactDOM from "react-dom";
import { useParams } from 'react-router-dom';

const Modal = ({children, onClose, width, height, isFull}) => {
    const contentRef = useRef();
    const { childId } = useParams();

    const handleClose = (e) => {
      e?.stopPropagation();
      if (onClose) onClose();
    };

    const modalClick = (e) => {
        e.stopPropagation();
        if (!contentRef.current.contains(e.target)) handleClose(e);
    }

    const modalContent = (
        <div
          className={classNames(classes.modal, { [classes.full]: isFull })}
          onClick={modalClick}
          style={{ zIndex: 9999 }} // đảm bảo modal nổi bật
        >
          <div
            className={classNames('modal-content', classes.modalContent)}
            ref={contentRef}
            style={{
              width: width || "auto",
              height: height || "auto",
              position: "relative",
            }}
          >
            <button onClick={handleClose} className={classNames(classes.close, {[classes.closeChild]: !!childId})}>
              &times;
            </button>
            {children}
          </div>
        </div>
      );

      return ReactDOM.createPortal(modalContent, document.getElementById("modal-root"));
}

export default Modal;