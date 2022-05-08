import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faQuestion} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import classNames from "classnames";
import styles from "./styles/AddIngredients.module.scss";
import {extractIngredient} from "../../utils/ingredients";

export function AddIngredientForm(props) {
    const [value, setValue] = useState("");

    function getIngredient(e) {
        e.preventDefault();
        const ingredient = extractIngredient(value);
        setValue("");
        props.handleAddIngredient(ingredient);
    }

    const addIngredientFormClassName = classNames({
        [styles.addIngredientForm]: true,
    });

    return <form onSubmit={getIngredient} className={addIngredientFormClassName}>
        <div>
            <FontAwesomeIcon icon={faQuestion}/>
            <div>
                Add an ingredients like "1 cup rice, 1 apple, or 1 1/2 tbsp salt".
            </div>
        </div>
        <input placeholder={"1.5 cups milk"} value={value} onChange={e => setValue(e.target.value)}/>
        <button role={'submit'}><FontAwesomeIcon icon={faPlus}/></button>
    </form>
}