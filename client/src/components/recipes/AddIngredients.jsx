import React, {useState, useEffect} from 'react';
import Ingredient from './IngredientListItem'
import classNames from 'classnames';
import styles from './styles/AddIngredients.scss';
import {faQuestion, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const measurements = ['tsp', 'teaspoon', 'tbsp', 'tablespoon', 'cup', 'pint', 'pt', 'fl oz', 'fluid ounce', 'quart', 'qt', 'ounce', 'oz', 'milliliter', 'ml', 'pound', 'lb', 'gram'];
const withMeasurement = new RegExp("^([1-9\\.\\/\\s]+)\\s(" + measurements.join("s?|") + "s?)\\s([a-zA-Z\\s]+)$", "i");
const noMeasurement = new RegExp("([1-9\\.\\/\\s]+)\\s([a-zA-Z\\s]+)$", "i");

const AddIngredients = (props) => {
    const [value, setValue] = useState("");

    function extractIngredient(e) {
        e.preventDefault();
        let quantity, measurement, name;
        if (withMeasurement.test(value)) { // follows format of "1 cup rice"
            const match = value.match(withMeasurement);
            quantity = match[1];
            measurement = match[2];
            name = match[3];
        } else if (noMeasurement.test(value)) { // no measurement provided: 1 apple
            const match = value.match(noMeasurement);
            quantity = match[1];
            measurement = '#';
            name = match[2];
        } else { // assume singular: paper towels
            quantity = 1;
            measurement = '#';
            name = value;
        }
        setValue("");
        props.handleAddIngredient(quantity, measurement, name);
    }

    const ingredientsContainerClassName = classNames({
        [styles.ingredientsContainer]: true,
        [props.containerClassName]: props.containerClassName,
    });
    const addIngredientButtonClassName = classNames({
        [styles.addIngredientButton]: true,
    });
    const addIngredientFormClassName = classNames({
        [styles.addIngredientForm]: true,
    });


    return (
        <div className={ingredientsContainerClassName}>
            <h3>Ingredient List</h3>
            {/*<button className={addIngredientButtonClassName} onClick={props.handleAddIngredient}>+*/}
            {/*    ingredient*/}
            {/*</button>*/}
            <form onSubmit={extractIngredient} className={addIngredientFormClassName}>
                <div>
                    <FontAwesomeIcon icon={faQuestion}/>
                    <div>
                        Add an ingredients like "1 cup rice, 1 apple, or 1 1/2 tbsp salt".
                    </div>
                </div>
                <input value={value} onChange={e => setValue(e.target.value)}/>
                <button role={'submit'}><FontAwesomeIcon icon={faPlus}/></button>
            </form>
            <ul>
                {props.ingredients.map((item, i) => {
                    return <Ingredient
                        key={item._id ? `${item._id}${i}` : i}
                        value={item}
                        id={i}
                        handleDeleteIngredient={props.handleDeleteIngredient}
                        handleUpdateIngredient={props.handleUpdateIngredient}
                        storeMode={props.storeMode}
                    />
                })}
            </ul>
        </div>
    )
};

export default AddIngredients;
