import React, {useEffect, useState, useContext} from 'react';
import {ApiStoreContext} from "../../client/stores/api_store";
import useScrolledBottom from "../../client/components/utilities/useScrolledBottom";
import classNames from "classnames";
import styles from "../styles/BrowseRecipes.module.scss";
import RecipeCard from "../../client/components/RecipeCard";
import LoadingNextPage from "../../client/components/utilities/LoadingNextPage";
import axios from "axios";
import {getCookieFromServer} from "../../client/utils/cookies";
import {handleJWT} from "../../hooks/handleJWT";

const Collection_id  = props => {
    handleJWT();
    const [recipes, setRecipes] = useState(new Map(props.recipes || []));
    const [title, setTitle] = useState(props.collection.name);
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(props.loadedAll);

    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        if (!loadedAll) {
            context.getCollectionRecipes(props.collection_id, {
                page: lastRecipePageLoaded + 1,
            })
                .then(collection => {
                    collection.recipes.forEach(r => recipes.set(r._id, r));
                    if (!title) setTitle(collection.name);
                    if (collection.recipes.length < 12) {
                        setLoadedAll(true);
                    } else {
                        setLastRecipePageLoaded(lastRecipePageLoaded + 1);
                    }
                });
        }
    }, [isBottom]);

    function removeRecipe(id) {
        context.deleteRecipe(id);
        setRecipes(r => {
            const m = r;
            m.delete(id);
            return m;
        })
    }

    const browseRecipesContainerClassName = classNames({
        [styles.browseRecipesContainer]: true,
    });

    return (
        <div className={styles.collectionsContainer}>
            <h1>{title}</h1>
            <div className={browseRecipesContainerClassName}>
                {Array.from(recipes.values()).map(recipe => {
                    return <RecipeCard deleteRecipe={removeRecipe} key={recipe.id} recipe={recipe}/>
                })}
                {recipes.size === 0 && <p>There doesn't seem to be anything here...</p>}
            </div>
            {loadedAll || recipes.size !== 0 || <LoadingNextPage/>}
        </div>
    )
};

export async function getServerSideProps({req, query}) {
    const currentFullUrl = req.protocol + "://" + req.headers.host.replace(/\/$/, "");
    const jwt = getCookieFromServer('jwt', req);

    const response = await axios.get(`${currentFullUrl}/api/collections/${query.collection_id}`, {
        headers: jwt ? {'x-access-token': jwt} : {},
    });
    return {
        props: {
            collection: response.data.collection,
            recipes: response.data.collection.recipes.map(r => [r.id, r]),
            collection_id: query.collection_id,
            loadedAll: response.data.collection.recipes.length < 12,
        }
    };
};

export default Collection_id;
