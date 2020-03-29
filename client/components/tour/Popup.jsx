import React, {useState, useContext, useEffect} from 'react';
import styles from "./Popup.module.scss";
import Router from 'next/router';
import classNames from 'classnames';
import {useSpring, animated} from "react-spring";
import {ApiStoreContext} from "../../stores/api_store";
import {tour} from "./tourData";
import TourPopup from "./TourPoint";
import Backdrop from "./Backdrop";
import {sampleUser} from "./sampleData";


function getElementAttributes(anchor) {
    const marginLeft = anchor.marginLeft || 0;
    const marginTop = anchor.marginTop || 0;

    const elements = document.getElementsByClassName(anchor.elementClass);

    const elementPos = elements[anchor.elementIndex || 0].getBoundingClientRect();

    if (anchor.highlightClass) {
        const highlights = document.getElementsByClassName(anchor.highlightClass);
        highlightElement(highlights[anchor.highlightIndex || 0]);
    }

    const top = elementPos.top + marginTop;
    const left = elementPos.x + marginLeft;

    scrollToElement(top, left);

    return {top, x: left};
}

function removeHighlights() {
    const elements = document.getElementsByClassName('tour-highlight');
    Array.from(elements).forEach(e => e.classList.remove('tour-highlight'));
}

function highlightElement(ele) {
    removeHighlights();
    ele.classList.add('tour-highlight');
}

function scrollToElement(top, left) {
    window.scrollTo({
        top, left, behavior: 'smooth',
    })
}

export default function Popup(props) {
    const [onTour, setOnTour] = useState(false);
    const [text, setText] = useState("");
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);

    const [anchorIndex, setAnchorIndex] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);

    const context = useContext(ApiStoreContext);

    function nextAnchor() {
        const currentPage = tour[pageIndex];
        console.log('acchor ', currentPage, anchorIndex);

        const attr = getElementAttributes(currentPage.popups[anchorIndex]);

        setTop(attr?.top - top);
        setLeft(attr?.x - left);
        setText(currentPage.popups[anchorIndex].message);

        setAnchorIndex(anchorIndex + 1);
    }

    async function nextPage() {
        const currentPage = tour[pageIndex];
        await Router.push(currentPage.url);
        setPageIndex(v => v+1);
    }

    async function startTour() {
        // set context values
        if (!context.loggedIn) {
            context.setUser(sampleUser)
        }
        context.setTouring(true);
        setOnTour(true);

        await handleNext();
    }

    function endTour() {
        removeHighlights();

        if (context.user.id === 'touring') {
            context.user = {}
        }

        setOnTour(false);
    }

    async function handleNext() {
        const currentPage = tour[pageIndex];

        if (pageIndex === 0 && anchorIndex === 0) {
            // starting
            await Router.push(currentPage.url);
            nextAnchor();

        } else if (anchorIndex === currentPage.popups.length - 1 && pageIndex < tour.length - 1) {
            // last anchor, more pages to go
            console.log('here');
            await nextPage();

            setAnchorIndex(0);
            nextAnchor();

            setTop(0);
            setLeft(0);
        } else if (anchorIndex < currentPage.popups.length) {
            // more anchors on current page

            setAnchorIndex(v => v+1);
            nextAnchor();
        } else {
            // last anchor, no more pages
            endTour();
        }
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
            {onTour && <TourPopup text={text} endTour={endTour} handleNext={handleNext} left={left} top={top}/>}
            {onTour && <Backdrop/>}
        </animated.div>
    </div>

}
