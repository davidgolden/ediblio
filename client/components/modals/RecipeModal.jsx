import React, {useEffect, useState, useContext} from 'react';
import Modal from "./Modal";
import RecipePage from "../recipes/RecipePage";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from './styles/RecipeModal.module.scss';
import {ApiStoreContext} from "../../stores/api_store";
import {clientFetch} from "../../utils/cookies";

export default function RecipeModal(props) {
    const context = useContext(ApiStoreContext);
    const [recipe, setRecipe] = useState(null);

    useEffect(() =>{
        async function fetchData(recipe_id) {
            const response = await clientFetch.get(`${window.location.origin}/api/recipes/${recipe_id}`);
            setRecipe(response.data.recipe);
        }

        const recipeIdRegex = /(\/recipes\/)([a-z0-9\-]{36})/;
        if (recipeIdRegex.test(window.location.href)) {
            const match = window.location.href.match(recipeIdRegex);
            fetchData(match[2]);
        }

    }, []);

    return <Modal className={styles.modal} onClose={context.closeRecipeModal}>
        {recipe ? <RecipePage recipe={recipe}/> : <div className={styles.loading}>
            <h3>Loading Recipe...</h3>
            <FontAwesomeIcon icon={faSpinner} spin/>
        </div>}
    </Modal>
}
