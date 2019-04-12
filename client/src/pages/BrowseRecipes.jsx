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
    const [filterTags, setFilterTags] = useState([]);
    const [filterAuthor, setFilterAuthor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        const query = {
            page: lastRecipePageLoaded + 1,
        };
        if (filterTags.length > 0) {
            query.tags = filterTags.toString();
        }
        if (filterAuthor) {
            query.author = filterAuthor;
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
    }, [isBottom, filterTags, searchTerm, filterAuthor]);

    useEffect(() => {
        setFilterAuthor(props.user_id);
        setLastRecipePageLoaded(-1);
        setLoadedAll(false);
    }, [props.user_id]);

    const searchByTerm = term => {
        setLoadedAll(false);
        setSearchTerm(term);
        setLastRecipePageLoaded(-1);
    };

    const sortByTag = tag => {
        let newTags = filterTags;
        if (newTags.includes(tag)) {
            newTags.splice(newTags.indexOf(tag), 1);
        } else {
            newTags.push(tag);
        }
        setLoadedAll(false);
        setFilterTags([...newTags]);
        setLastRecipePageLoaded(-1);
    };

    const browseRecipesContainerClassName = classNames({
        [styles.browseRecipesContainer]: true,
    });

    return (
        <div>
            <TagFilterBar sortByTag={sortByTag} selectedTags={filterTags} searchTerm={searchTerm} setSearchTerm={searchByTerm} />
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
