import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import CollectionCard from "../client/components/CollectionCard";
import styles from './styles/BrowseRecipes.scss';
import {ApiStoreContext} from "../client/stores/api_store";
import DeleteButton from "../client/components/utilities/buttons/DeleteButton";
import Link from 'next/link';
import RecipeCard from "../client/components/RecipeCard";

const ViewUserRecipes = (props) => {
    const [collections, setCollections] = useState(props.collections || []);
    const context = useContext(ApiStoreContext);

    function removeFromCollection(id) {
        context.removeCollection(id)
            .then(() => {
                setCollections(c => c.filter(c => c._id !== id));
            })
    }

    return (
        <div className={styles.browseRecipesContainer}>
            {collections.map(c => <CollectionCard key={c._id} removeFromCollection={removeFromCollection} collection={c}/>)}
            {props.recipes.map(r => <RecipeCard recipe={r} key={r._id} deleteRecipe={() => {}} />)}
        </div>
    )
};

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
        recipes: responses[1].data.recipes,
        user_id: query.user_id,
    }
};

export default ViewUserRecipes;
