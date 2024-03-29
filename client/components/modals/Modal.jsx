import React, {useContext, useRef} from 'react';
import styles from './styles/Modal.module.scss';
import Button from "../utilities/buttons/Button";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {observer} from "mobx-react";
import {ApiStoreContext} from "../../stores/api_store";
import classNames from 'classnames';

function Modal(props) {
    const context = useContext(ApiStoreContext);
    const modalRef = useRef(null);

    function handleClick(e) {
        if (!modalRef.current.contains(e.target)) {
            handleClose();
        }
    }

    const containerClassName = classNames({
        [styles.modalBackground]: true,
        [props.className]: props.className,
    });

    function handleClose() {
        context.removeTopModal();
        props.onClose && props.onClose();
    }

    return <div className={containerClassName} onClick={handleClick}>
        <div className={styles.modalContainer} style={props.style} ref={modalRef}>
            <Button aria-label={"Close"} onClick={handleClose}>
                <FontAwesomeIcon icon={faTimes} />
            </Button>
            <div className={styles.modalContent}>
                {props.children}
            </div>
        </div>
    </div>
}

Modal.defaultProps = {
    style: {},
};

export default observer(Modal);
