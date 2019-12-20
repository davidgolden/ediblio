import React, {useState, useEffect, useContext} from 'react';
import RecipeCard from "../client/src/components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';
import SortingBar from "../client/src/components/recipes/SortingBar";
import LoadingNextPage from '../client/src/components/utilities/LoadingNextPage';
import useScrolledBottom from "../client/src/components/utilities/useScrolledBottom";
import {ApiStoreContext} from "../client/src/stores/api_store";
import Header from "../client/src/components/header/Header";
import Notification from "../client/src/components/header/Notification";

const BrowseRecipes = props => {
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(-1);
    const [loadedAll, setLoadedAll] = useState(false);
    const [filterTags, setFilterTags] = useState([]);
    const [filterAuthor, setFilterAuthor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [orderBy, setOrderBy] = useState('desc');
    const [recipes, setRecipes] = useState([]);

    const context = useContext(ApiStoreContext);

    const isBottom = useScrolledBottom();

    useEffect(() => {
        const query = {
            page: lastRecipePageLoaded + 1,
            orderBy: orderBy,
            sortBy: sortBy,
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
                    setRecipes(r => r.concat(recipes));
                    if (recipes.length < 12) {
                        setLoadedAll(true);
                    } else {
                        setLastRecipePageLoaded(lastRecipePageLoaded + 1);
                    }
                });
        }
    }, [isBottom, filterTags, searchTerm, filterAuthor, orderBy, sortBy]);

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

    const handleSortByChange = value => {
        setLoadedAll(false);
        setLastRecipePageLoaded(-1);
        setSortBy(value);
    };

    const handleOrderByChange = value => {
        setLoadedAll(false);
        setLastRecipePageLoaded(-1);
        setOrderBy(value);
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
            <SortingBar
                sortByTag={sortByTag}
                selectedTags={filterTags}
                searchTerm={searchTerm}
                setSearchTerm={searchByTerm}
                sortBy={sortBy}
                orderBy={orderBy}
                handleSortByChange={handleSortByChange}
                handleOrderByChange={handleOrderByChange}
            />
            <div className={browseRecipesContainerClassName}>
                {recipes.map(recipe => {
                    return <RecipeCard key={recipe._id} recipe={recipe}/>
                })}
                {recipes.length === 0 && <p>There doesn't seem to be anything here...</p>}
            </div>
            {loadedAll || recipes.length !== 0 || <LoadingNextPage/>}
        </div>
    )
};

export default BrowseRecipes;
