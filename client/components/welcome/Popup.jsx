import React, {useState, useRef, forwardRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styles from "./Popup.module.scss";
import Router from 'next/router';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {useSpring, animated} from "react-spring";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

class TourPopup extends React.Component {
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
        this.setState({
            visible: false,
        })
    };

    render() {
        const popupClassName = classNames({
            [styles.tourLoc]: true,
            [styles.tourLocClosed]: !this.state.visible,
        });

        return <div ref={this.popupRef} className={popupClassName} style={{top: `${this.props.top}px`, left: `${this.props.left}px`}}>
            <button onClick={this.close}><FontAwesomeIcon icon={faTimes} /></button>
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

const tourPages = ['/', '/add'];

export default function Popup(props) {
    const [onTour, setOnTour] = useState(false);
    const popupRef = useRef(null);

    async function goToNextPage(pageIndex) {
        await Router.push(tourPages[pageIndex]);
        const anchors = document.getElementsByClassName('welcome');

        function goToNextPopup(anchorIndex) {
            if (popupRef.current && anchorIndex > 0 && anchorIndex < anchors.length) {
                // should trigger if there is already a popup on the current page
                const newPosition = anchors[anchorIndex].getBoundingClientRect();
                const oldPosition = popupRef.current.getDomNode().getBoundingClientRect();
                const diffTop = newPosition.top - oldPosition.top;
                const diffLeft = newPosition.x - oldPosition.x;
                popupRef.current.transform(diffLeft, diffTop);
                popupRef.current.setText(anchors[anchorIndex].getAttribute('data-msg'));
                popupRef.current.setOnNext(() => goToNextPopup(anchorIndex+1));

            } else if (anchorIndex === 0) {
                const pos = anchors[anchorIndex].getBoundingClientRect();
                const popup = <TourPopup ref={popupRef} text={anchors[anchorIndex].getAttribute('data-msg')}
                                       onNext={() => goToNextPopup(anchorIndex+1)} top={pos.top} left={pos.x}/>
                setTimeout(() => {
                    ReactDOM.render(popup, anchors[anchorIndex]);
                }, 250);
            } else {
                // go to next page
                if (tourPages.length > pageIndex + 1) {
                    goToNextPage(pageIndex + 1)
                } else {
                    // end tour
                    popupRef.current.close();
                }
            }
        }

        goToNextPopup(0);
    }

    function startTour() {
        goToNextPage(0);
        setOnTour(true);
    }

    const popupClassName = classNames({
        [styles.container]: true,
        [styles.containerHidden]: onTour,
    });

    const [mounted, setMounted] = useState(false);
    const {x} = useSpring({
        from: {x: 0},
        x: mounted ? 1 : 0,
        config: {duration: 1000}
    });

    useEffect(() => setMounted(true), []);

    return <div className={popupClassName}>
        <animated.div
            style={{
                opacity: x.interpolate({range: [0, 1], output: [0.3, 1]}),
                transform: x
                    .interpolate({
                        range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
                        output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1]
                    })
                    .interpolate(x => `scale(${x})`)
            }}>
            New to Ediblio?
            <button onClick={startTour}>Take the Tour!</button>
        </animated.div>
    </div>

}
