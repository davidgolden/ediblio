import React, {useContext} from 'react';
import styles from './styles/Modal.scss';
import Button from "../utilities/buttons/Button";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {observer} from "mobx-react";
import {ApiStoreContext} from "../../stores/api_store";
import classNames from 'classnames';

function Modal(props) {
    const context = useContext(ApiStoreContext);

    const containerClassName = classNames({
        [styles.modalContainer]: true,
        [props.className]: props.className,
    });

    return <div className={styles.modalBackground}>
        <div className={containerClassName} style={props.style}>
            <Button aria-label={"Close"} onClick={context.removeTopModal}>
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
