import React, {useState, useEffect, useContext} from 'react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";
import LoadingNextPage from '../components/utilities/LoadingNextPage';
import {ApiStoreContext} from "../stores/api_store";
import useScrolledBottom from "../components/utilities/useScrolledBottom";

const BrowseRecipes = () => {
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(-1);
    const [loadedAll, setLoadedAll] = useState(false);
    const [filterTag, setFilterTag] = useState('');

    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        if (!loadedAll) {
            context.getRecipes({
                page: lastRecipePageLoaded + 1,
                tag: filterTag,
            })
                .then(recipes => {
                    if (recipes.length < 12) {
                        setLoadedAll(true);
                    } else {
                        setLastRecipePageLoaded(lastRecipePageLoaded + 1);
                    }
                });
        }
    }, [isBottom, filterTag]);

    const sortByTag = tag => {
        if (tag !== filterTag) {
            setLoadedAll(false);
            setFilterTag(tag);
            setLastRecipePageLoaded(-1);
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
