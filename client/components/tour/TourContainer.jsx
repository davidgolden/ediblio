import React, {useContext} from 'react';
import dynamic from 'next/dynamic';
import {observer} from "mobx-react";
import {ApiStoreContext} from "../../stores/api_store";

const Popup = dynamic(() => import("./Popup"));

const TourContainer = observer(props => {
    const context = useContext(ApiStoreContext);
    let shouldShow = true;

    if (context.loggedIn) {
        const daysSinceCreated = Math.round((new Date() - new Date(context.user.created_at))/(1000*60*60*24));
        if (daysSinceCreated > 7) {
            shouldShow = false;
        }
    }

    if (!shouldShow) return <div/>;

    return <Popup/>
});

export default TourContainer;
