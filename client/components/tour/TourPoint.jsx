import React, {useLayoutEffect, useState} from "react"
import {createPortal} from 'react-dom';
import classNames from "classnames";
import styles from "./Popup.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";


function scrollToElement(top, left) {
    window.scrollTo({
        top, left, behavior: 'smooth',
    })
}

function removeHighlights() {
    const elements = document.getElementsByClassName('tour-highlight');
    Array.from(elements).forEach(e => e.classList.remove('tour-highlight'));
}

function highlightElement(ele) {
    removeHighlights();
    ele.classList.add('tour-highlight');
}

const contentClassName = classNames({
    [styles.content]: true,
});

export default function TourPopup(props) {
    const [translate, setTranslate] = useState("");

    useLayoutEffect(() => {
        if (props.currentAnchor) {
            const elements = document.getElementsByClassName(props.currentAnchor.elementClass);
            const elementPos = elements[props.currentAnchor.elementIndex || 0].getBoundingClientRect();

            if (props.currentAnchor.highlightClass) {
                const highlights = document.getElementsByClassName(props.currentAnchor.highlightClass);
                highlightElement(highlights[props.currentAnchor.highlightIndex || 0]);
            }

            const marginLeft = props.currentAnchor.marginLeft || 0;
            const marginTop = props.currentAnchor.marginTop || 0;

            const top = elementPos.top + marginTop;
            const left = elementPos.x + marginLeft;

            scrollToElement(top, left);

            setTranslate(`translateY(${top}px) translateX(${left}px)`);
        }
    }, [props.currentAnchor]);

    if (!props.currentAnchor) return <div/>;

    function endTour() {
        removeHighlights();
        props.endTour();
    }

    return createPortal(<div className={contentClassName}
                             style={{transform: translate}}>

        <button onClick={endTour}><FontAwesomeIcon icon={faTimes}/></button>
        <p id={'tour-popup'}>{props.currentAnchor.message}</p>
        <button onClick={props.handleNext}>Next</button>

    </div>, document.body);
}

TourPopup.propTypes = {
    text: PropTypes.string.isRequired,
    onNext: PropTypes.func.isRequired,
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
};
