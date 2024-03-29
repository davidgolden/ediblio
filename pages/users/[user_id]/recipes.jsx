import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import CollectionCard from "../../../client/components/collections/CollectionCard";
import styles from '../../styles/BrowseRecipes.module.scss';
import {ApiStoreContext} from "../../../client/stores/api_store";
import RecipeCard from "../../../client/components/recipes/RecipeCard";
import useScrolledBottom from "../../../client/hooks/useScrolledBottom";
import {observer} from "mobx-react";
import {values} from "mobx";
import UserBanner from "../../../client/components/users/UserBanner";
import {clientFetch, getUrlParts} from "../../../client/utils/cookies";

const Recipes = observer((props) => {
    const [collections, setCollections] = useState(props.collections || []);
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(props.loadedAll);
    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        if (props.user_id === context.user?.id) {
            clientFetch.get(`/api/users/${props.user_id}/collections`)
                .then(response => setCollections(response.data.collections))
        }
    }, [context.user?.collections?.length !== props.collections.length]);

    useEffect(() => {
        if (!loadedAll) {
            const query = {
                page: lastRecipePageLoaded + 1,
                author: props.user_id,
                orderBy: 'desc',
                sortBy: 'created_at',
            }
            context.getRecipes(query)
                .then(response => {
                    context.addRecipes(response);
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
            await clientFetch.delete(`/api/users/${context.user.id}/collections/${id}`);
            context.user.collections = context.user.collections.filter(c => c.id !== id);
        } catch (error) {
            context.handleError(error);
        }
    }

    async function followCollection(id) {
        try {
            await clientFetch.post(`/api/users/${context.user.id}/collections/${id}`);

            const response = await clientFetch.get(`/api/collections/${id}`);
            context.user.collections.push(response.data.collection);
        } catch (error) {
            context.handleError(error);
        }
    }

    return (
        <div>
            <UserBanner user={props.user}
                        images={values(context.recipes).filter(r => r.image).slice(0, 4).map(r => r.image)}/>
            <div className={styles.browseRecipesContainer}>
                {collections.map(c => <CollectionCard
                    key={c.id}
                    unfollowCollection={unfollowCollection}
                    deleteCollection={deleteCollection}
                    followCollection={followCollection}
                    collection={c}
                />)}
                {values(context.recipes).map(r => <RecipeCard recipe={r} key={r.id} deleteRecipe={() => {
                }}/>)}
            </div>
        </div>
    )
});

export async function getServerSideProps ({req, query}) {
    const {currentBaseUrl, currentFullUrl, jwt} = getUrlParts(req);

    const responses = await Promise.all([
        await axios.get(`${currentBaseUrl}/api/users/${query.user_id}/collections`, {
            headers: jwt ? {'x-access-token': jwt} : {},
        }),
        await axios.get(`${currentBaseUrl}/api/recipes`, {
            params: {
                orderBy: 'desc',
                sortBy: 'created_at',
                author: query.user_id,
            },
            headers: jwt ? {'x-access-token': jwt} : {},
        }),
        await axios.get(`${currentBaseUrl}/api/users/${query.user_id}`, {
            headers: jwt ? {'x-access-token': jwt} : {},
        }),
    ]);
    return {
        props: {
            collections: responses[0].data.collections,
            recipes: responses[1].data.recipes,
            loadedAll: responses[1].data.recipes.length < 12,
            user: responses[2].data.user,
            user_id: query.user_id,
            currentFullUrl
        }
    }
}

export default Recipes;
