import React from 'react';
import dynamic from 'next/dynamic';
import {observer} from "mobx-react";
import cookie from 'js-cookie';
import {getDaysSince} from "../../utils/cookies";

const Popup = dynamic(() => import("./Popup"));


const TourContainer = observer(props => {
    let shouldShow = true;

    const tourDismissed = cookie.get('tour-dismissed');
    let dismissedCount = cookie.get('tour-dismissed-count');

    if (!tourDismissed) {
        return <Popup/>;
    }

    const daysSince = getDaysSince(tourDismissed, true);
    dismissedCount = parseInt(dismissedCount);

    if (dismissedCount === 1 && daysSince < 1) {
        shouldShow = false;
    } else if (dismissedCount === 2 && daysSince < 3) {
        shouldShow = false;
    } else if (dismissedCount < 6 && daysSince < 7) {
        shouldShow = false;
    } else if (dismissedCount >= 6 && daysSince < 30) {
        shouldShow = false;
    }

    if (!shouldShow) return <div/>;

    return <Popup/>;
});

export default TourContainer;
