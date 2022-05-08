import React, {useState, useEffect, useContext} from 'react';
import RecipeCard from "../client/components/recipes/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.module.scss';
import LoadingNextPage from '../client/components/utilities/LoadingNextPage';
import useScrolledBottom from "../client/hooks/useScrolledBottom";
import {ApiStoreContext} from "../client/stores/api_store";
import axios from 'axios';
import {getUrlParts} from "../client/utils/cookies";
import {values} from "mobx";
import {observer} from "mobx-react";

const browseRecipesContainerClassName = classNames({
    [styles.browseRecipesContainer]: true,
});

const Index = observer(props => {
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(props.loadedAll);

    const context = useContext(ApiStoreContext);
    const isBottom = useScrolledBottom();

    useEffect(() => {
        const query = {
            page: lastRecipePageLoaded + 1,
        };
        if (!loadedAll) {
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

    async function removeRecipe(id) {
        await context.deleteRecipe(id);
        context.removeRecipe(id);
    }

    return (
        <div>
            <div className={browseRecipesContainerClassName}>
                {values(context.recipes).map(recipe => {
                    return <RecipeCard deleteRecipe={removeRecipe} key={recipe.id} recipe={recipe}/>
                })}
                {context.recipes.size === 0 && <p>There doesn't seem to be anything here...</p>}
            </div>
            {loadedAll || context.recipes.size !== 0 || <LoadingNextPage/>}
        </div>
    )
});


export async function getServerSideProps({req}) {
    const {currentBaseUrl, currentFullUrl, jwt} = getUrlParts(req);

    const response = await axios.get(`${currentBaseUrl}/api/recipes`, {
        headers: jwt ? {'x-access-token': jwt} : {},
        params: {
            page: 0,
        }
    });

    return {
        props: {
            recipes: response.data.recipes,
            loadedAll: response.data.recipes.length < 12,
            currentFullUrl,
        }
    }
}

export default Index;
