import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles/Checkbox.module.scss';

export default function Checkbox(props) {
    return <label className={styles.checkbox}>
        <input type={'checkbox'} checked={props.checked} onChange={props.onChange} />
        <span/>
    </label>
}

Checkbox.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};
