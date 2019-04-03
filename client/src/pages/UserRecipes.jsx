import React, { useState, useContext, useEffect } from 'react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/UserRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";
import LoadingNextPage from "../components/utilities/LoadingNextPage";
import {ApiStoreContext} from "../stores/api_store";

const UserRecipes = props => {
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(false);

    const context = useContext(ApiStoreContext);

    useEffect(() => {
        context.getRecipes({
            author: props.user_id,
        });

        // this.disabler = autorun(() => {
        //     if (this.props.apiStore.distanceToBottom === 0 && !this.state.loadedAll) {
        //         this.props.apiStore.getRecipes({
        //             page: this.state.lastRecipePageLoaded + 1,
        //             author: this.props.user_id,
        //         })
        //             .then(recipes => {
        //                 this.setState(prevState => {
        //                     if (recipes.length === 0) {
        //                         return {
        //                             loadedAll: true,
        //                         }
        //                     } else {
        //                         return {
        //                             lastRecipePageLoaded: prevState.lastRecipePageLoaded + 1,
        //                         }
        //                     }
        //                 })
        //             });
        //     }
        // })
    });

    const sortByTag = tag => {
        if (tag === 'all') {
            context.getRecipes({
                author: props.user_id,
            })
        } else {
            context.getRecipes({
                tag: tag,
                author: props.user_id,
            })
        }
    };

    const recipeCardsContainerClassName = classNames({
        [styles.recipeCardsContainer]: true,
    });

    return (
        <div>
            <TagFilterBar sortByTag={sortByTag}/>
            <div className={recipeCardsContainerClassName}>
                {context.recipes.map(recipe => {
                    return <RecipeCard key={recipe._id} recipe={recipe}/>
                })}
                {context.recipes.length === 0 && <p>There doesn't seem to be anything here...</p>}
            </div>
            {loadedAll || <LoadingNextPage/>}
        </div>
    )
};

export default UserRecipes;
