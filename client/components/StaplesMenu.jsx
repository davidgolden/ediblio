import React, {useContext, useEffect, useState, useCallback} from 'react';
import {clientFetch} from "../utils/cookies";
import {ApiStoreContext} from "../stores/api_store";
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import styles from './styles/StaplesMenu.module.scss';
import {CSSTransition, TransitionGroup} from "react-transition-group";

const stapleTransition = {
    enter: styles.transitionEnter,
    enterActive: styles.transitionEnterActive,
    enterDone: styles.transitionEnterDone,
    exit: styles.transitionExit,
    exitActive: styles.transitionExitActive,
    exitDone: styles.transitionExitDone,
};

export default function StaplesMenu(props) {
    const context = useContext(ApiStoreContext);
    const [suggestedStaples, setSuggestedStaples] = useState([]);
    const [offset, setOffset] = useState(0);

    async function handleAddIngredient(ingName) {
        props.handleAddIngredient({
            measurement: '#',
            quantity: 1,
            name: ingName,
        });
        setSuggestedStaples(v => v.filter(name => name !== ingName));
        await fetchStaples(1);
    }

    async function fetchStaples(limit) {
        const response = await clientFetch.get(`/api/users/${context.user.id}/staples`, {
            params: {
                offset,
                limit,
            }
        });
        const {suggestedStaples} = response.data;
        setOffset(v => v+limit);
        setSuggestedStaples(v => v.concat(suggestedStaples.map(s => s.name)));
    }

    useEffect(() => {
        fetchStaples(10);
    }, []);

    return <div>
        <TransitionGroup>
            {suggestedStaples.map(s => <CSSTransition classNames={stapleTransition} in={suggestedStaples.includes(s)} timeout={500}>
                <div className={styles.staple}>
                    <span>{s}</span>
                    <button onClick={() => handleAddIngredient(s)}><FontAwesomeIcon icon={faPlus}/></button>
                </div>
            </CSSTransition>)}
        </TransitionGroup>
    </div>
}

StaplesMenu.propTypes = {
    handleAddIngredient: PropTypes.func.isRequired,
};
