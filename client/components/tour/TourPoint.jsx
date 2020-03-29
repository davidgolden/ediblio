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
    ele.classList.add('tour-highlight');
}

const contentClassName = classNames({
    [styles.content]: true,
});

const width = 420;

function checkIfOffScreenRight(x) {
    return x + width > window.innerWidth;
}

function checkIfOffScreenLeft(x) {
    return x < 0;
}

function amountOffScreenRight(x) {
    return width - (window.innerWidth - x);
}

function amountOffScreenLeft(x) {
    return x - width;
}

export default function TourPopup(props) {
    const [translate, setTranslate] = useState("");

    function findBestPosition(x, y) {
        const offScreenRight = checkIfOffScreenRight(x);
        const offScreenLeft = checkIfOffScreenLeft(x);

        if (!offScreenRight && !offScreenLeft) {
            moveToPoint(x, y);
        } else if (offScreenRight && !offScreenLeft) {
            findBestPosition(x - amountOffScreenRight(x), y);
        } else if (offScreenLeft && !offScreenRight) {
            findBestPosition(x + amountOffScreenLeft(x), y);
        } else if (offScreenLeft && offScreenRight) {

        }
    }

    function moveToPoint(x, y) {
        scrollToElement(y, x);
        setTranslate(`translateY(${y}px) translateX(${x}px)`);
    }

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

            findBestPosition(left, top);
        }
    }, [props.currentAnchor]);

    if (!props.currentAnchor) return <div/>;

    function endTour() {
        removeHighlights();
        props.endTour();
    }

    function handleNext() {
        removeHighlights();
        props.handleNext();
    }

    return createPortal(<div className={contentClassName}
                             style={{transform: translate}}>

        <button onClick={endTour}><FontAwesomeIcon icon={faTimes}/></button>
        <p id={'tour-popup'}>{props.currentAnchor.message}</p>
        <button onClick={handleNext}>Next</button>

    </div>, document.body);
}

TourPopup.propTypes = {
    currentAnchor: PropTypes.shape({
        message: PropTypes.string.isRequired,
    }),
    handleNext: PropTypes.func.isRequired,
    endTour: PropTypes.func.isRequired,
};
