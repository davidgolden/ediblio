import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons'

const InCloudButton = props => {
    const inCloudButtonClassName = classNames({
        [styles.inCloudButton]: true,
        [styles.inCloudButtonDisabled]: props.disabled,
        [props.className]: props.className,
    });

    return (
        <Button {...props} className={inCloudButtonClassName}>
            <FontAwesomeIcon icon={faBook}/>
        </Button>
    )
}

export default InCloudButton;
