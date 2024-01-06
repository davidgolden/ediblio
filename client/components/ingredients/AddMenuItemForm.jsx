import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faQuestion} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import classNames from "classnames";
import styles from "./styles/AddIngredients.module.scss";

export function AddMenuItemForm(props) {
    const [value, setValue] = useState("");

    const addIngredientFormClassName = classNames({
        [styles.addIngredientForm]: true,
    });

    function handleSubmit(e) {
        e.preventDefault();
        setValue("");
        props.handleAddMenuItem(value);
    }

    return <form onSubmit={handleSubmit} className={addIngredientFormClassName}>
        <input placeholder={"Fried Rice"} value={value} onChange={e => setValue(e.target.value)}/>
        <button role={'submit'}><FontAwesomeIcon icon={faPlus}/></button>
    </form>
}