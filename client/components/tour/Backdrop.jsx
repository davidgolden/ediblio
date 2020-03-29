import React from 'react';
import {createPortal} from 'react-dom';
import styles from './Popup.module.scss';
import classNames from 'classnames';

const backdropClassName = classNames({
    [styles.backdrop]: true,
});

export default function Backdrop(props) {
    return createPortal(<div className={backdropClassName} />, document.body);
}
