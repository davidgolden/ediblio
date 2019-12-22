import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

const DeleteButton = props => {
    const deleteButtonClassName = classNames({
        [styles.deleteButton]: true,
        [styles.deleteButtonDisabled]: props.disabled,
        [props.className]: props.className,
    });

    return (
        <Button {...props} className={deleteButtonClassName}>
            <FontAwesomeIcon icon={faTrashAlt}/>
        </Button>
    )
}

export default DeleteButton;
