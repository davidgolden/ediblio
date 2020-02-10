import React, {useContext, useState, useRef, useEffect} from 'react';
import classNames from 'classnames';
import styles from './styles/IngredientListItem.scss';
import {ApiStoreContext} from "../../stores/api_store";
import {observer} from "mobx-react";
import Checkbox from "../utilities/Checkbox";

const Ingredient = observer((props) => {
    const context = useContext(ApiStoreContext);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(props.value.name);
    const [quantity, setQuantity] = useState(props.value.quantity);
    const [measurement, setMeasurement] = useState(props.value.measurement);
    const ref = useRef(null);

    const ingredientRowClassName = classNames({
        [styles.ingredientRow]: true,
        "draggable": !props.storeMode,
        [styles.ingredientRowEditing]: editing,
    });

    useEffect(() => {
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [editing, name, quantity, measurement]);

    function handleClick(e) {
        const outside = ref.current && !ref.current.contains(e.target);
        if (editing && outside) {
            setEditing(false);
            props.handleUpdateIngredient(props.id, {measurement, name, quantity});
        } else if (!outside && !editing) {
            setEditing(true);
        }
    }

    if(!props.storeMode) {
        return (
            <li className={ingredientRowClassName} data-id={props.dataId}>
                <div onClick={handleClick} ref={ref}>
                {editing ? <input
                    type='number'
                    step="0.01"
                    required
                    onChange={e => setQuantity(e.target.value)}
                    name='quantity'
                    placeholder='1'
                    value={quantity}
                /> : <span>{props.value.quantity}</span>}
                {editing ? <select
                    name='measurement'
                    value={measurement}
                    onChange={e => setMeasurement(e.target.value)}
                >
                    {context.measurements.map(m => <option value={m.short_name}>{m.short_name}</option>)}
                </select> : <span>{props.value.measurement}</span>}
                {editing ? <input
                    type='text'
                    required
                    name='name'
                    placeholder='Carrots'
                    onChange={e => setName(e.target.value)}
                    value={name}
                /> : <span>{props.value.name}</span>}
                </div>
                <Checkbox checked={props.ingredientToRemove} onChange={() => props.addToIngredientsToRemove(props.id)}/>
            </li>
        )
    } else {
        return (
            <div className={ingredientRowClassName} data-id={props.dataId}>
                <Checkbox checked={props.ingredientToRemove} onChange={() => props.addToIngredientsToRemove(props.id)}/>
                <p>{props.value.quantity} {props.value.measurement.replace("#", "")} {props.value.name}</p>
            </div>
        )
    }
});

export default Ingredient;
