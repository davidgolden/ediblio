import React from 'react';
import dynamic from 'next/dynamic';
import {observer} from "mobx-react";
import cookie from 'js-cookie';

const Popup = dynamic(() => import("./Popup"));


const TourContainer = props => {
    return cookie.get('td') ? <div/> : <Popup />
};

export default TourContainer;
