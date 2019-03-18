import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'

const AddToGroceryListButton = props => {
    const addToGroceryListButtonClassName = classNames({
        [styles.addToGroceryListButton]: true,
        [styles.addToGroceryListButtonDisabled]: props.disabled,
        [props.className]: props.className,
    });


    return (
        <Button {...props} className={addToGroceryListButtonClassName}>
            <FontAwesomeIcon icon={faShoppingCart}/>
        </Button>
    )
};

export default AddToGroceryListButton;
