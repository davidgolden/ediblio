import React, {useEffect, useState} from 'react';
import Modal from "./Modal";
import RecipePage from "../recipes/RecipePage";
import axios from "axios";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from 'prop-types';
import styles from './styles/RecipeModal.module.scss';

export default function RecipeModal(props) {
    const [recipe, setRecipe] = useState(null);

    useEffect(() =>{
        async function fetchData(recipe_id) {
            const response = await axios.get(`${window.location.origin}/api/recipes/${recipe_id}`);
            setRecipe(response.data.recipe);
        }

        const recipeIdRegex = /(\/recipes\/)([a-z0-9\-]{36})/;
        if (recipeIdRegex.test(window.location.href)) {
            const match = window.location.href.match(recipeIdRegex);
            fetchData(match[2]);
        }

    }, []);

    return <Modal className={styles.modal} onClose={() => {
        document.getElementsByTagName('body')[0].style.overflow = 'auto';
        window.history.back()
    }}>
        {recipe ? <RecipePage recipe={recipe}/> : <FontAwesomeIcon icon={faSpinner} spin/>}
    </Modal>
}

RecipeModal.propTypes = {
    recipe_id: PropTypes.string.isRequired,
};
