import React, {useRef} from 'react';
import classes from './modal.module.scss';
import classNames from 'classnames';
import ReactDOM from "react-dom";

const Modal = ({children, setShowModal, width, height, isFull}) => {
    const contentRef = useRef();
    const modalClick = (e) => {
        e.stopPropagation();
        if (!contentRef.current.contains(e.target)) setShowModal(false);
    }

    const closeButtonOnClick = (e) => {
        e.stopPropagation();
        setShowModal(false);
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
            <button onClick={closeButtonOnClick} className={classes.close}>
              &times;
            </button>
            {children}
          </div>
        </div>
      );

      return ReactDOM.createPortal(modalContent, document.getElementById("modal-root"));
}

export default Modal;