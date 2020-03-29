import React from "react"
import {createPortal} from 'react-dom';
import classNames from "classnames";
import styles from "./Popup.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";


export default function TourPopup(props) {
    const contentClassName = classNames({
        [styles.content]: true,
    });

    return createPortal(<div className={contentClassName}
                             style={{top: `${props.top}px`, left: `${props.left}px`}}>

        <button onClick={props.endTour}><FontAwesomeIcon icon={faTimes}/></button>
        <p id={'tour-popup'}>{props.text}</p>
        <button onClick={props.handleNext}>Next</button>

    </div>, document.body);
}

TourPopup.propTypes = {
    text: PropTypes.string.isRequired,
    onNext: PropTypes.func.isRequired,
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
};
