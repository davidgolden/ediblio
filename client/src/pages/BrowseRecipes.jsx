import React, {useState, useEffect, useContext} from 'react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";
import LoadingNextPage from '../components/utilities/LoadingNextPage';
import {ApiStoreContext} from "../stores/api_store";

const BrowseRecipes = () => {
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(false);

    const context = useContext(ApiStoreContext);
    const recipes = context.state.recipes;

    // apiStore.getRecipes();

    // useEffect(() => {
    //     if (apiStore.distanceToBottom === 0 && !loadedAll) {
    //         apiStore.getRecipes({
    //             page: lastRecipePageLoaded + 1,
    //         })
    //             .then(recipes => {
    //                 if (recipes.length === 0) {
    //                     setLoadedAll(true)
    //                 } else {
    //                     setLastRecipePageLoaded(lastRecipePageLoaded + 1);
    //                 }
    //             });
    //     }
    // });

    const sortByTag = tag => {
        if (tag === 'all') {
            apiStore.getRecipes()
        } else {
            apiStore.getRecipes({
                tag: tag,
            })
        }
    };

    const browseRecipesContainerClassName = classNames({
        [styles.browseRecipesContainer]: true,
    });

    return (
            <div>
                <TagFilterBar sortByTag={sortByTag}/>
                <div className={browseRecipesContainerClassName}>
                    {recipes.map(recipe => {
                        return <RecipeCard key={recipe._id} recipe={recipe}/>
                    })}
                    {recipes.length === 0 && <p>There doesn't seem to be anything here...</p>}
                </div>
                {loadedAll || recipes.length !== 0 || <LoadingNextPage/>}
            </div>
    )
};

export default BrowseRecipes;
