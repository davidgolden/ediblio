import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const AddToCloudButton = props => {
    const removeButtonClassName = classNames({
        [styles.addButton]: true,
        [styles.addButtonDisabled]: props.disabled,
        [props.className]: props.className,
    });

    return (
        <Button {...props} className={removeButtonClassName}>
            <FontAwesomeIcon icon={faPlus}/>
        </Button>
    )
}

export default AddToCloudButton;
