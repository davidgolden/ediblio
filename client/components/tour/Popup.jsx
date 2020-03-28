import React, {useState, useRef, useContext, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styles from "./Popup.module.scss";
import Router from 'next/router';
import classNames from 'classnames';
import {useSpring, animated} from "react-spring";
import {ApiStoreContext} from "../../stores/api_store";
import {tour} from "./tourData";
import TourPopup from "./TourPoint";
import Backdrop from "./Backdrop";


function getElementAttributes(anchor) {
    const marginLeft = anchor.marginLeft || 0;
    const marginTop = anchor.marginTop || 0;

    const elements = document.getElementsByClassName(anchor.elementClass);
    const elementPos = elements[anchor.elementIndex || 0].getBoundingClientRect();

    highlightElement(elements[anchor.elementIndex || 0]);

    return {top: elementPos.top + marginTop, x: elementPos.x + marginLeft};
}

function highlightElement(ele) {
    const elements = document.getElementsByClassName('tour-highlight')
    Array.from(elements).forEach(e => e.classList.remove('tour-highlight'));
    ele.classList.add('tour-highlight');
}

export default function Popup(props) {
    const [onTour, setOnTour] = useState(false);
    const context = useContext(ApiStoreContext);
    const popupRef = useRef(null);
    const backdropRef = useRef(null);

    function handleClose() {
        popupRef.current.close();
        backdropRef.current.close();
    }

    async function goToNextPage(pageIndex) {
        const currentPage = tour[pageIndex];
        await Router.push(currentPage.url);
        const container = document.createElement('span');
        document.body.appendChild(container);

        async function goToNextPopup(anchorIndex) {
            if (popupRef.current && anchorIndex > 0 && anchorIndex < currentPage.popups.length) {
                // should trigger if there is already a popup on the current page
                const {top, x} = getElementAttributes(currentPage.popups[anchorIndex]);

                const oldPosition = popupRef.current.getDomNode().getBoundingClientRect();
                const diffTop = top - oldPosition.top;
                const diffLeft = x - oldPosition.x;
                popupRef.current.transform(diffLeft, diffTop);
                popupRef.current.setText(currentPage.popups[anchorIndex].message);
                popupRef.current.setOnNext(() => goToNextPopup(anchorIndex + 1));

            } else if (anchorIndex === 0) {
                const {top, x} = getElementAttributes(currentPage.popups[anchorIndex]);

                const popup = <TourPopup handleClose={handleClose} ref={popupRef} text={currentPage.popups[anchorIndex].message}
                                         onNext={() => goToNextPopup(anchorIndex + 1)} top={top} left={x}/>
                setTimeout(() => {
                    ReactDOM.render(popup, container);
                }, 250);
            } else {
                // go to next page
                document.body.removeChild(container);

                if (tour.length > pageIndex + 1) {

                    goToNextPage(pageIndex + 1)
                } else {
                    // end tour
                    popupRef.current.close();

                    context.addModal('login');
                }
            }
        }

        goToNextPopup(0);
    }

    function startTour() {
        const container = document.createElement('div');
        document.body.insertBefore(container, document.body.firstChild);
        ReactDOM.render(<Backdrop ref={backdropRef} />, container);


        document.body.style.overflow = 'hidden';
        context.setTouring(true);
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
