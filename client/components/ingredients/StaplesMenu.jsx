import React from 'react';
import PropTypes from 'prop-types';
import styles from "./styles/StaplesMenu.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTrashAlt} from "@fortawesome/free-solid-svg-icons";

export default function StaplesMenu(props) {
    return <div>
        {props.staples.map(staple => {
            let label = "";
            if (staple.measurement !== "#") {
                label += `${staple.quantity} ${staple.measurement} `;
            }
            label += staple.name;
            return <div className={styles.staple}>
                <span>{label}</span>
                <button onClick={() => props.handleAddIngredient(staple)}><FontAwesomeIcon icon={faPlus}/></button>
                <button onClick={() => props.handleDeleteStaple(staple.id)}><FontAwesomeIcon icon={faTrashAlt}/></button>
            </div>
        })}
    </div>
}

StaplesMenu.propTypes = {
    handleAddIngredient: PropTypes.func.isRequired,
    handleDeleteStaple: PropTypes.func.isRequired,
};
