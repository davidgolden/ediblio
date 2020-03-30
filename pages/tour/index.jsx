import React from 'react';
import classNames from "classnames";
import styles from "../styles/BrowseRecipes.module.scss";
import RecipeCard from "../../client/components/recipes/RecipeCard";
import {sampleRecipes} from "../../client/components/tour/sampleData";

export default function Index() {
    const browseRecipesContainerClassName = classNames({
        [styles.browseRecipesContainer]: true,
    });

    return (
        <div>
            <div className={browseRecipesContainerClassName}>
                {sampleRecipes.map(recipe => {
                    return <RecipeCard deleteRecipe={() => {}} key={recipe.id} recipe={recipe}/>
                })}
            </div>
        </div>
    )
}
