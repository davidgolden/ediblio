import React, {useState, useEffect, useContext} from 'react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";
import LoadingNextPage from '../components/utilities/LoadingNextPage';
import {ApiStoreContext} from "../stores/api_store";
import useScrolledBottom from "../components/utilities/useScrolledBottom";

const BrowseRecipes = () => {
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(false);

    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        if (isBottom && !loadedAll) {
            context.getRecipes({
                page: lastRecipePageLoaded + 1,
            })
                .then(recipes => {
                    if (recipes.length === 0) {
                        setLoadedAll(true);
                    } else {
                        setLastRecipePageLoaded(lastRecipePageLoaded + 1);
                    }
                });
        }
    }, [isBottom]);

    const sortByTag = tag => {
        if (tag === 'all') {
            context.getRecipes()
        } else {
            context.getRecipes({
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
                    {Array.from(context.recipes.values()).map(recipe => {
                        return <RecipeCard key={recipe._id} recipe={recipe}/>
                    })}
                    {context.recipes.size === 0 && <p>There doesn't seem to be anything here...</p>}
                </div>
                {loadedAll || context.recipes.size !== 0 || <LoadingNextPage/>}
            </div>
    )
};

export default BrowseRecipes;
