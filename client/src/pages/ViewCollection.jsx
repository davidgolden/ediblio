import React, {useEffect, useState, useContext} from 'react';
import {ApiStoreContext} from "../stores/api_store";
import useScrolledBottom from "../components/utilities/useScrolledBottom";
import classNames from "classnames";
import styles from "./styles/BrowseRecipes.scss";
import RecipeCard from "../components/RecipeCard";
import LoadingNextPage from "../components/utilities/LoadingNextPage";

const ViewCollection  = props => {
    const [recipes, setRecipes] = useState([]);
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(-1);
    const [loadedAll, setLoadedAll] = useState(false);

    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        if (!loadedAll) {
            context.getCollectionRecipes(props.collection_id, {
                page: lastRecipePageLoaded + 1,
            })
                .then(collection => {
                    setRecipes(r => r.concat(collection.recipes));
                    if (collection.recipes.length < 12) {
                        setLoadedAll(true);
                    } else {
                        setLastRecipePageLoaded(lastRecipePageLoaded + 1);
                    }
                });
        }
    }, [isBottom]);

    const browseRecipesContainerClassName = classNames({
        [styles.browseRecipesContainer]: true,
    });

    return (
        <div>
            <div className={browseRecipesContainerClassName}>
                {recipes.map(recipe => {
                    return <RecipeCard key={recipe._id} recipe={recipe}/>
                })}
                {recipes.size === 0 && <p>There doesn't seem to be anything here...</p>}
            </div>
            {loadedAll || recipes.size !== 0 || <LoadingNextPage/>}
        </div>
    )
}

export default ViewCollection;
