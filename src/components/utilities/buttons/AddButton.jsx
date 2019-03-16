import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const AddButton = props => {
    const removeButtonClassName = classNames({
        [styles.addButton]: true,
        [props.className]: props.className,
    });

    return (
        <Button {...props} className={removeButtonClassName}>
            <FontAwesomeIcon icon={faPlus}/>
        </Button>
    )
}

export default AddButton;
