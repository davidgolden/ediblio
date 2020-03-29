import React from 'react';
import {createPortal} from 'react-dom';
import styles from './Popup.module.scss';
import classNames from 'classnames';

export default function Backdrop(props) {
    const backdropClassName = classNames({
        [styles.backdrop]: true,
    });

    return createPortal(<div className={backdropClassName} />, document.body);
}
