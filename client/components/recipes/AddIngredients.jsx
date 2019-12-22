import React, {useState} from 'react';
import Ingredient from './IngredientListItem'
import classNames from 'classnames';
import styles from './styles/AddIngredients.scss';
import {faQuestion, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Sortable from "react-sortablejs";

const DefaultItemRenderer = (props) => {
    const {data: {name, depth}, drag, drop} = props;
    const ref = React.useRef(null);

    drag(drop(ref));

    return (
        <div ref={ref} style={{marginLeft: depth * 20}}>
            {name}
        </div>
    );
};

const measurements = ['tsp', 'teaspoon', 'tbsp', 'tablespoon', 'cup', 'pint', 'pt', 'fl oz', 'fluid ounce', 'quart', 'qt', 'ounce', 'oz', 'milliliter', 'ml', 'pound', 'lb', 'gram', 'gallon', 'gal', 'liter', 'l'];
const withMeasurement = new RegExp("^([1-9\\.\\/\\s]+)\\s(" + measurements.join("s\?|") + "s?)\\s([a-zA-Z\\s]+)$", "i");
const noMeasurement = new RegExp("([1-9\\.\\/\\s]+)\\s([a-zA-Z\\s]+)$", "i");

const shortenedMeasurements = {
    'teaspoon': 'tsp',
    'tablespoon': 'tbsp',
    'pint': 'pt',
    'fluid ounce': 'fl oz',
    'quart': 'qt',
    'ounce': 'oz',
    'milliliter': 'ml',
    'pound': 'lb',
    'gallon': 'gal',
    'liter': 'l'
};

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

            if (/\//.test(quantity)) { // using fraction
                const nums = quantity.split(" ");
                quantity = Number(nums[0]) + eval(nums[1]);
            }

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

        // test if we've used the long version of a measurement, and switch to abbreviation if necessary
        if (measurement in shortenedMeasurements) {
            measurement = shortenedMeasurements[measurement];
        } else if (/[\d]*s$/.test(measurement)) { // test that we're not using the plural of something
            measurement = measurement.substring(0, measurement.length - 1);
        }

        setValue("");
        props.handleAddIngredient(quantity, measurement, name);
    }

    const ingredientsContainerClassName = classNames({
        [styles.ingredientsContainer]: true,
        [props.containerClassName]: props.containerClassName,
    });
    const addIngredientFormClassName = classNames({
        [styles.addIngredientForm]: true,
    });


    return (
        <div className={ingredientsContainerClassName}>
            <h3>Ingredient List</h3>
            <form onSubmit={extractIngredient} className={addIngredientFormClassName}>
                <div>
                    <FontAwesomeIcon icon={faQuestion}/>
                    <div>
                        Add an ingredients like "1 cup rice, 1 apple, or 1 1/2 tbsp salt".
                    </div>
                </div>
                <input placeholder={"1.5 cups milk"} value={value} onChange={e => setValue(e.target.value)}/>
                <button role={'submit'}><FontAwesomeIcon icon={faPlus}/></button>
            </form>
            <Sortable
                options={{
                    draggable: '.draggable'
                }}
                tag={"ul"}
                onChange={(order, sortable, evt) => {
                    // order returns array of item keys
                    props.handleUpdateAllIngredients(order.map(m => JSON.parse(m));
                }}>
                {props.ingredients.map((item, i) => {
                    return <Ingredient
                        key={item._id ? `${item._id}${i}` : i}
                        value={item}
                        id={i}
                        dataId={JSON.stringify(item)}
                        handleDeleteIngredient={props.handleDeleteIngredient}
                        handleUpdateIngredient={props.handleUpdateIngredient}
                        storeMode={props.storeMode}
                    />
                })}
            </Sortable>
        </div>
    )
};

export default AddIngredients;
