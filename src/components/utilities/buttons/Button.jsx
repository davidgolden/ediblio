import React from 'react';
import classNames from 'classnames';
import styles from './styles/Button.scss';

const Button = props => {
    const buttonClassName = classNames({
        [styles.button]: true,
        [props.className]: props.className,
    });

    return (
        <button {...props} className={buttonClassName}>
            {props.children}
        </button>
    )
}

export default Button;
