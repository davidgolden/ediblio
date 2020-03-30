import React from 'react';
import dynamic from 'next/dynamic';
import {observer} from "mobx-react";
import cookie from 'js-cookie';
import {getDaysSince} from "../../utils/cookies";

const Popup = dynamic(() => import("./Popup"));


const TourContainer = observer(props => {
    return cookie.get('td') ? <div/> : <Popup />
});

export default TourContainer;
