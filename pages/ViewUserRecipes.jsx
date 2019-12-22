import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import CollectionCard from "../client/components/CollectionCard";
import styles from './styles/BrowseRecipes.scss';
import {ApiStoreContext} from "../client/stores/api_store";
import RecipeCard from "../client/components/RecipeCard";
import useScrolledBottom from "../client/components/utilities/useScrolledBottom";
import {observer} from "mobx-react";

const ViewUserRecipes = observer((props) => {
    const [recipes, setRecipes] = useState(new Map(props.recipes || []));
    const [collections, setCollections] = useState(props.collections || []);
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(props.loadedAll);
    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        if (props.user_id === context.user._id) {
            axios.get(`/api/users/${props.user_id}/collections`)
                .then(response => setCollections(response.data.collections))
        }
    }, [context.user?.collections.length !== props.collections.length]);

    useEffect(() => {
        if (!loadedAll) {
            context.getRecipes({
                page: lastRecipePageLoaded + 1,
                author: props.user_id,
            })
                .then(response => {
                    response.forEach(r => recipes.set(r._id, r));
                    if (response.length < 12) {
                        setLoadedAll(true);
                    } else {
                        setLastRecipePageLoaded(lastRecipePageLoaded + 1);
                    }
                });
        }
    }, [isBottom]);

    function removeFromCollection(id) {
        context.removeCollection(id)
            .then(() => {
                setCollections(c => c.filter(c => c._id !== id));
            })
    }

    return (
        <div className={styles.browseRecipesContainer}>
            {collections.map(c => <CollectionCard key={c._id} removeFromCollection={removeFromCollection} collection={c}/>)}
            {Array.from(recipes.values()).map(r => <RecipeCard recipe={r} key={r._id} deleteRecipe={() => {}} />)}
        </div>
    )
});

ViewUserRecipes.getInitialProps = async ({req, query}) => {
    const responses = await Promise.all([
        await axios.get(`${req.protocol}://${req.headers.host}/api/users/${query.user_id}/collections`, {
            headers: {
                cookie: req.headers.cookie,
            },
        }),
        await axios.get(`${req.protocol}://${req.headers.host}/api/recipes`, {
            headers: {
                cookie: req.headers.cookie,
            },
            params: {
                author: query.user_id,
            }
        }),
    ]);
    return {
        collections: responses[0].data.collections,
        recipes: responses[1].data.recipes.map(r => [r._id, r]),
        loadedAll: responses[1].data.recipes.length < 12,
        user_id: query.user_id,
    }
};

export default ViewUserRecipes;
