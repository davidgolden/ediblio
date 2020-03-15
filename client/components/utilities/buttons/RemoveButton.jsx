import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus } from '@fortawesome/free-solid-svg-icons'

const RemoveButton = props => {
    const removeButtonClassName = classNames({
        [styles.removeButton]: true,
        [styles.removeButtonDisabled]: props.disabled,
        [props.className]: props.className,
    });

    return (
        <Button {...props} className={removeButtonClassName}>
            <FontAwesomeIcon icon={faMinus}/>
        </Button>
    )
}

export default RemoveButton;
