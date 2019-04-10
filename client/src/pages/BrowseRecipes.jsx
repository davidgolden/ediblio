import React, {useState, useEffect, useContext} from 'react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";
import LoadingNextPage from '../components/utilities/LoadingNextPage';
import {ApiStoreContext} from "../stores/api_store";
import useScrolledBottom from "../components/utilities/useScrolledBottom";

const BrowseRecipes = props => {
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(-1);
    const [loadedAll, setLoadedAll] = useState(false);
    const [filterTag, setFilterTag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    // apparently console logging user_id is the only way to get useEffect to work :(
    console.log(props.user_id);

    useEffect(() => {
        const query = {
            page: lastRecipePageLoaded + 1,
            tag: filterTag,
        };
        if (props.user_id) {
            query.author = props.user_id;
        }
        if (typeof searchTerm === 'string') {
            query.searchTerm = searchTerm;
        }
        if (!loadedAll) {
            context.getRecipes(query)
                .then(recipes => {
                    if (recipes.length < 12) {
                        setLoadedAll(true);
                    } else {
                        setLastRecipePageLoaded(lastRecipePageLoaded + 1);
                    }
                });
        }
    }, [isBottom, filterTag, searchTerm, props.user_id]);

    const searchByTerm = term => {
        setLoadedAll(false);
        setSearchTerm(term);
        setLastRecipePageLoaded(-1);
    };

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
            <TagFilterBar sortByTag={sortByTag} searchTerm={searchTerm} setSearchTerm={searchByTerm} />
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
