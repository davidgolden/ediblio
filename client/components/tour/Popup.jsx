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

export default function Popup(props) {
    const [onTour, setOnTour] = useState(false);

    const [anchorIndex, setAnchorIndex] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);

    const [currentPopup, setCurrentPopup] = useState(null);

    const context = useContext(ApiStoreContext);

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
        context.setTouring(false);
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
            setAnchorIndex(v => v+1);
            setCurrentPopup(tour[pageIndex].popups[anchorIndex]);
        } else if (anchorIndex === currentPage.popups.length - 1 && pageIndex < tour.length - 1) {
            // last anchor, more pages to go
            await nextPage();
            setAnchorIndex(0);
            setCurrentPopup(tour[pageIndex].popups[anchorIndex]);
        } else if (anchorIndex < currentPage.popups.length) {
            // more anchors on current page
            setAnchorIndex(v => v+1);
            setCurrentPopup(tour[pageIndex].popups[anchorIndex]);
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
            {onTour && <TourPopup currentAnchor={currentPopup} endTour={endTour} handleNext={handleNext} />}
            {onTour && <Backdrop/>}
        </animated.div>
    </div>

}
