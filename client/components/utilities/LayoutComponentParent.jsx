import React, {useState, useEffect} from 'react';
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function LayoutComponentParent(props) {
    const [showChild, setShowChild] = useState(false);

    // Wait until after client-side hydration to show
    useEffect(() => {
        setShowChild(true);
    }, []);

    if (!showChild) {
        // You can show some kind of placeholder UI here
        return <FontAwesomeIcon icon={faSpinner} spin/>;
    }

    return props.children;
}
