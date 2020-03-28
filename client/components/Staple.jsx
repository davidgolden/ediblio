import React from 'react';
import styles from "./styles/StaplesMenu.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';

export default function Staple(props) {
    return <div className={styles.staple}>
        <span>{props.staple}</span>
        <button onClick={() => props.handleAddIngredient(props.staple)}><FontAwesomeIcon icon={faPlus}/></button>
    </div>
}

Staple.propTypes = {
    staple: PropTypes.string.isRequired,
    handleAddIngredient: PropTypes.func.isRequired,
};
