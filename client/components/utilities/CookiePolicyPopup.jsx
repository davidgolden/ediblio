import React, {useState, useEffect} from 'react';
import {CSSTransition} from "react-transition-group";
import styles from './styles/CookiePolicyPopup.module.scss';
import Router from 'next/router';
import cookie from 'js-cookie';

const translateTransition = {
    enter: styles.transitionEnter,
    enterActive: styles.transitionEnterActive,
    enterDone: styles.transitionEnterDone,
    exit: styles.transitionExit,
    exitActive: styles.transitionExitActive,
    exitDone: styles.transitionExitDone,
};

export default function CookiePolicyPopup() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!cookie.get('ca')) {
            setTimeout(() => setMounted(true), 4000);
        }
    }, []);

    async function handleClick() {
        await Router.push("/legal/cookies-policy");
    }

    function handleAccept() {
        setMounted(false);
        cookie.set('ca', 1, {expires:365});
    }

    if (cookie.get('ca')) return <div/>;

    return <CSSTransition classNames={translateTransition} in={mounted} timeout={1000}>
        <div className={styles.container}>
            <div>
                This site uses cookies to provide you with a great user experience. By using Ediblio. you accept our <button onClick={handleClick}>Cookies Policy</button>.
                <button onClick={handleAccept}>Got it!</button>
            </div>
        </div>
    </CSSTransition>
}
