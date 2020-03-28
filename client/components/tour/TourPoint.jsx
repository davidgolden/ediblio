import React from "react";
import classNames from "classnames";
import styles from "./Popup.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

export default class TourPopup extends React.Component {
    constructor(props) {
        super(props);

        this.popupRef = React.createRef();

        this.state = {
            text: props.text,
            onNext: props.onNext,
            visible: true,
        }
    }

    getDomNode = () => {
        if (this.popupRef.current) {
            return this.popupRef.current;
        }
        return {};
    };

    transform = (x, y) => {
        this.popupRef.current.style.transform = `translateY(${y}px) translateX(${x}px)`;
    };

    setText = text => {
        this.setState({
            text,
        })
    };

    setOnNext = onNext => {
        this.setState({
            onNext,
        })
    };

    close = () => {
        document.body.style.overflow = 'auto';
        this.setState({
            visible: false,
        })
    };

    render() {
        const contentClassName = classNames({
            [styles.content]: true,
            [styles.contentVisible]: this.state.visible,
        });

        return <div ref={this.popupRef} className={contentClassName}
                 style={{top: `${this.props.top}px`, left: `${this.props.left}px`}}>
                <button onClick={this.props.handleClose}><FontAwesomeIcon icon={faTimes}/></button>
                <p id={'tour-popup'}>{this.state.text}</p>
                <button onClick={this.state.onNext}>Next</button>
            </div>
    }
}

TourPopup.propTypes = {
    text: PropTypes.string.isRequired,
    onNext: PropTypes.func.isRequired,
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
};
