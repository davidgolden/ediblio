import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons'

const AddToGroceryListButton = props => {
    const addToGroceryListButtonClassName = classNames({
        [styles.addToGroceryListButton]: true,
        [styles.addToGroceryListDisabled]: props.disabled,
        [props.className]: props.className,
    });

    return (
        <Button {...props} className={addToGroceryListButtonClassName}>
            <FontAwesomeIcon icon={faShoppingBag}/>
        </Button>
    )
}

export default AddToGroceryListButton;
