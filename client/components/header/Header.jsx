import React, {useState, useContext, useEffect, useRef} from 'react';
import classNames from 'classnames';
import styles from './styles/Header.module.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faListUl,
    faPlus,
    faBook,
    faUser,
    faChevronLeft,
    faChevronDown, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import Link from "next/link";
import {observer} from "mobx-react";
import useDebounce from "../utilities/useDebounce";

const navContainerClassName = classNames({
    [styles.navContainer]: true,
});

const Header = observer((props) => {
    const [didMount, setDidMount] = React.useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [foundRecipes, setFoundRecipes] = useState([]);
    React.useLayoutEffect(() => setDidMount(true), []);

    const searchRef = useRef(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (debouncedSearchTerm) {
            context.getRecipes({
                page: 0,
                page_size: 20,
                searchTerm,
            })
                .then(response => {
                    setFoundRecipes(response);
                });
        }
    }, [debouncedSearchTerm]);

    const context = useContext(ApiStoreContext);

    const linksContainerClassName = classNames({
        [styles.linksContainer]: true,
    });

    useEffect(() => {
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [navOpen, searchOpen]);

    function handleClick(e) {
        if (navOpen) {
            setNavOpen(false);
        }
        if (searchOpen && !searchRef.current.contains(e.target)) {
            setSearchOpen(false);
            setFoundRecipes([]);
            setSearchTerm("");
        }
    }

    const userLinkClassName = classNames({
        [styles.userLink]: true,
        [styles.userLinkLogin]: !context.user,
    });
    const searchClassName = classNames({
        [styles.search]: true,
        [styles.searchOpen]: searchOpen,
    });

    return (
        <nav className={navContainerClassName}>
            {didMount && window.history.length > 1 &&
            <Button className={styles.backButton} onClick={() => window.history.back()}>
                <FontAwesomeIcon icon={faChevronLeft}/>
            </Button>}

            <h1>
                <Link href="/"><img src={"/images/ediblio_logo.png"}/></Link>
            </h1>

            <div className={styles.rightNav}>

                <div className={searchClassName} ref={searchRef}>
                    <Button onClick={() => setSearchOpen(v => !v)}>
                        <FontAwesomeIcon icon={faSearch}/>
                    </Button>
                    <input placeholder={"Search"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>

                {context.user ?
                    <button onClick={() => setNavOpen(v => !v)} className={userLinkClassName}>
                        {context.user.profile_image ?
                            <img src={context.user.profile_image}/> :
                            <FontAwesomeIcon icon={faUser}/>} <FontAwesomeIcon icon={faChevronDown}/>
                    </button>
                    : <button className={userLinkClassName} onClick={() => context.addModal("login")}>
                        Login
                    </button>}
            </div>

            {searchOpen && foundRecipes.length > 0 && <div className={styles.recipeSearch}>
                <ul>
                    {foundRecipes.map(recipe => {
                        return <li>
                            <Link href={`/recipes/[recipe_id]`} as={`/recipes/${recipe.id}`}>
                                <a>
                                    <img src={recipe.image} alt={"Recipe Image"}/>
                                    {recipe.name}
                                </a>
                            </Link>
                        </li>
                    })}
                </ul>
            </div>}

            {navOpen && context.user && <div className={linksContainerClassName}>
                <ul>
                    <li>
                        <Link href={'/'}>
                            <a>
                                <FontAwesomeIcon icon={faSearch}/> Browse Recipes
                            </a>
                        </Link>
                    </li>
                    <li>
                        <Link href={"/users/[user_id]/groceries"} as={`/users/${context.user.id}/groceries`}>
                            <a>
                                <FontAwesomeIcon icon={faListUl}/> Grocery List
                            </a>
                        </Link>
                    </li>
                    <li>
                        <Link href={'/add'}>
                            <a>
                                <FontAwesomeIcon icon={faPlus}/> Add Recipe
                            </a>
                        </Link>
                    </li>
                    <li>
                        <Link href={"/users/[user_id]/recipes"} as={`/users/${context.user.id}/recipes`}>
                            <a>
                                <FontAwesomeIcon icon={faBook}/> My Recipes
                            </a>
                        </Link>
                    </li>
                    <li>
                        <Link href={"/users/[user_id]/settings"} as={`/users/${context.user.id}/settings`}>
                            <a>
                                <FontAwesomeIcon icon={faUser}/> Settings
                            </a>
                        </Link>
                    </li>
                    <li>
                        <button onClick={context.userLogout}><FontAwesomeIcon icon={faSignOutAlt}/> Log Out</button>
                    </li>
                </ul>
            </div>}
        </nav>
    )
});

export default Header;
