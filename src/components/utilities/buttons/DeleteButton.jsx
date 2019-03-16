import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const DeleteButton = props => {
    const removeButtonClassName = classNames({
        [styles.removeButton]: true,
        [props.className]: props.className,
    });

    return (
        <Button {...props} className={removeButtonClassName}>
            <FontAwesomeIcon icon={faTrash}/>
        </Button>
    )
}

export default DeleteButton;
