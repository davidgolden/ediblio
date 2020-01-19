import React, {useState, useEffect, useContext} from 'react';
import RecipeCard from "../client/components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';
import SortingBar from "../client/components/recipes/SortingBar";
import LoadingNextPage from '../client/components/utilities/LoadingNextPage';
import useScrolledBottom from "../client/components/utilities/useScrolledBottom";
import {ApiStoreContext} from "../client/stores/api_store";
import axios from 'axios';

function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => ++value); // update the state to force render
}

const Index = props => {
    const [lastRecipePageLoaded, setLastRecipePageLoaded] = useState(0);
    const [loadedAll, setLoadedAll] = useState(props.loadedAll);
    const [filterTags, setFilterTags] = useState([]);
    const [filterAuthor, setFilterAuthor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [orderBy, setOrderBy] = useState('desc');
    const [recipes, setRecipes] = useState(new Map(props.recipes || []));

    const forceUpdate = useForceUpdate();

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
                .then(response => {
                    if (query.page !== 'undefined' && query.page === 0) {
                        recipes.clear();
                    }
                    return response;
                })
                .then(response => {
                    response.forEach(rec => recipes.set(rec._id, rec));
                    if (response.length < 12) {
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

    function searchByTerm(term) {
        setLoadedAll(false);
        setSearchTerm(term);
        setLastRecipePageLoaded(-1);
    };

    function handleSortByChange(value) {
        setLoadedAll(false);
        setLastRecipePageLoaded(-1);
        setSortBy(value);
    }

    function handleOrderByChange(value) {
        setLoadedAll(false);
        setLastRecipePageLoaded(-1);
        setOrderBy(value);
    }

    function sortByTag(tag) {
        let newTags = filterTags;
        if (newTags.includes(tag)) {
            newTags.splice(newTags.indexOf(tag), 1);
        } else {
            newTags.push(tag);
        }
        setLoadedAll(false);
        setFilterTags([...newTags]);
        setLastRecipePageLoaded(-1);
    }

    async function removeRecipe(id) {
        await context.deleteRecipe(id);
        setRecipes(r => {
            r.delete(id);
            return r;
        });
        forceUpdate();
    }

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
                {Array.from(recipes.values()).map(recipe => {
                    return <RecipeCard deleteRecipe={removeRecipe} key={recipe._id} recipe={recipe}/>
                })}
                {recipes.size === 0 && <p>There doesn't seem to be anything here...</p>}
            </div>
            {loadedAll || recipes.size !== 0 || <LoadingNextPage/>}
        </div>
    )
};

Index.getInitialProps = async ({req}) => {
    const currentFullUrl = typeof window !== 'undefined' ? window.location.origin : req.protocol + "://" + req.headers.host.replace(/\/$/, "");

    const response = await axios.get(`${currentFullUrl}/api/recipes`, {
        headers: req?.headers?.cookie && {
            cookie: req.headers.cookie,
        },
        params: {
            page: 0,
            orderBy: 'desc',
            sortBy: 'created_at',
        }
    });
    return {
        recipes: response.data.recipes.map(r => [r._id, r]),
        loadedAll: response.data.recipes.length < 12,
    }
};

export default Index;