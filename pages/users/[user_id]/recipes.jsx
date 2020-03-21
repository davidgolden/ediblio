import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import CollectionCard from "../../../client/components/CollectionCard";
import styles from '../../styles/BrowseRecipes.module.scss';
import {ApiStoreContext} from "../../../client/stores/api_store";
import RecipeCard from "../../../client/components/RecipeCard";
import useScrolledBottom from "../../../client/components/utilities/useScrolledBottom";
import {observer} from "mobx-react";
import UserBanner from "../../../client/components/UserBanner";
import {getCookieFromServer} from "../../../client/utils/cookies";

const Recipes = observer((props) => {
    const [recipes, setRecipes] = useState(props.recipes);
    const [collections, setCollections] = useState(props.collections || []);
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(props.loadedAll);
    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        // page transition
        setRecipes(props.recipes);
    }, [props.recipes]);

    useEffect(() => {
        if (props.user_id === context.user?.id) {
            axios.get(`/api/users/${props.user_id}/collections`)
                .then(response => setCollections(response.data.collections))
        }
    }, [context.user?.collections?.length !== props.collections.length]);

    useEffect(() => {
        if (!loadedAll) {
            context.getRecipes({
                page: lastRecipePageLoaded + 1,
                author: props.user_id,
                orderBy: 'desc',
                sortBy: 'created_at',
            })
                .then(response => {
                    response.forEach(r => recipes.push(r));
                    if (response.length < 12) {
                        setLoadedAll(true);
                    } else {
                        setLastRecipePageLoaded(lastRecipePageLoaded + 1);
                    }
                });
        }
    }, [isBottom]);

    function deleteCollection(id) {
        context.deleteCollection(id)
            .then(() => {
                setCollections(c => c.filter(c => c.id !== id));
            })
    }

    async function unfollowCollection(id) {
        try {
            await axios.delete(`/api/users/${context.user.id}/collections/${id}`);
            context.user.collections = context.user.collections.filter(c => c.id !== id);
        } catch (error) {
            context.handleError(error);
        }
    }

    async function followCollection(id) {
        try {
            await axios.post(`/api/users/${context.user.id}/collections/${id}`);

            const response = await axios.get(`/api/collections/${id}`);
            context.user.collections.push(response.data.collection);
        } catch (error) {
            context.handleError(error);
        }
    }

    return (
        <div>
            <UserBanner user={props.user}
                        images={recipes.filter(r => r.image).slice(0, 4).map(r => r.image)}/>
            <div className={styles.browseRecipesContainer}>
                {collections.map(c => <CollectionCard
                    key={c.id}
                    unfollowCollection={unfollowCollection}
                    deleteCollection={deleteCollection}
                    followCollection={followCollection}
                    collection={c}
                />)}
                {recipes.map(r => <RecipeCard recipe={r} key={r._id} deleteRecipe={() => {
                }}/>)}
            </div>
        </div>
    )
});

export async function getServerSideProps ({req, query}) {
    const currentFullUrl = req.protocol + "://" + req.headers.host.replace(/\/$/, "");

    const responses = await Promise.all([
        await axios.get(`${currentFullUrl}/api/users/${query.user_id}/collections`, {
            headers: {
                'x-access-token': getCookieFromServer('jwt', req),
            },
        }),
        await axios.get(`${currentFullUrl}/api/recipes`, {
            headers: {
                'x-access-token': getCookieFromServer('jwt', req),
            },
            params: {
                orderBy: 'desc',
                sortBy: 'created_at',
                author: query.user_id,
            }
        }),
        await axios.get(`${currentFullUrl}/api/users/${query.user_id}`, {
            headers: {
                'x-access-token': getCookieFromServer('jwt', req),
            },
        }),
    ]);
    return {
        props: {
            collections: responses[0].data.collections,
            recipes: responses[1].data.recipes,
            loadedAll: responses[1].data.recipes.length < 12,
            user: responses[2].data.user,
            user_id: query.user_id,
        }
    }
};

export default Recipes;
