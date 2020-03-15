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
    faChevronDown, faSignOutAlt, faBars, faImage, faTimes
} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import Link from "next/link";
import {observer} from "mobx-react";
import useDebounce from "../utilities/useDebounce";
import {CSSTransition} from "react-transition-group";
import Rating from "react-rating";

const navContainerClassName = classNames({
    [styles.navContainer]: true,
});
const linksContainerClassName = classNames({
    [styles.linksContainer]: true,
});

const mobileTransition = {
    enter: styles.transitionEnter,
    enterActive: styles.transitionEnterActive,
    enterDone: styles.transitionEnterDone,
    exit: styles.transitionExit,
    exitActive: styles.transitionExitActive,
    exitDone: styles.transitionExitDone,
};

function NavLinks(props) {
    const context = useContext(ApiStoreContext);

    return <ul>
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
}

const SearchBar = React.forwardRef((props, ref) => {
    const context = useContext(ApiStoreContext);

    const searchClassName = classNames({
        [styles.search]: true,
        [styles.searchOpen]: props.searchOpen,
    });

    return <div className={searchClassName} ref={ref}>
        <Button onClick={() => props.setSearchOpen(v => !v)}>
            <FontAwesomeIcon icon={faSearch}/>
        </Button>
        <input placeholder={"Search"} value={props.searchTerm} onChange={e => props.setSearchTerm(e.target.value)}/>
        {props.searchOpen && props.foundRecipes.length > 0 && <div className={styles.recipeSearch}>
            <ul>
                {props.foundRecipes.map(recipe => {
                    return <li>
                        <Button onClick={async () => await context.openRecipeModal(recipe.id)}>
                            {recipe.image ? <img src={recipe.image} alt={"Recipe Image"}/> :
                                <div className={styles.noImage}><FontAwesomeIcon icon={faImage}/></div>}
                            <div>
                                <span>{recipe.name}</span>
                                {recipe.total_ratings > 0 && <Rating
                                    readonly={true}
                                    quiet={true}
                                    initialRating={recipe.avg_rating}
                                    fractions={2}
                                    emptySymbol={"far fa-star"}
                                    fullSymbol="fas fa-star"
                                />}
                            </div>
                        </Button>
                    </li>
                })}
            </ul>
        </div>}
    </div>
});

const Header = observer((props) => {
    const [didMount, setDidMount] = React.useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [foundRecipes, setFoundRecipes] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);
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

    useEffect(() => {
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [navOpen, searchOpen, mobileOpen]);

    function handleClick(e) {
        if (navOpen) {
            setNavOpen(false);
        }

        if (mobileOpen && !searchRef.current?.contains(e.target)) {
            setSearchOpen(false);
            setFoundRecipes([]);
        } else if (searchOpen && !searchRef.current?.contains(e.target)) {
            setSearchOpen(false);
            setFoundRecipes([]);
            setSearchTerm("");
        }
    }

    const userLinkClassName = classNames({
        [styles.userLink]: true,
        [styles.userLinkLogin]: !context.user,
    });

    return (
        <nav className={navContainerClassName}>
            <CSSTransition in={mobileOpen} classNames={mobileTransition} timeout={500}>
                <div className={styles.mobileMenu}>
                    <SearchBar ref={searchRef} searchOpen={true} setSearchOpen={setSearchOpen} searchTerm={searchTerm}
                               setSearchTerm={setSearchTerm} foundRecipes={foundRecipes}/>
                    {context.user ? <NavLinks/> : <div>
                        <button className={userLinkClassName} onClick={() => context.addModal("login")}>
                            Login
                        </button>
                    </div>}
                </div>
            </CSSTransition>

            {didMount && window.history.length > 1 &&
            <Button className={styles.backButton} onClick={() => window.history.back()}>
                <FontAwesomeIcon icon={faChevronLeft}/>
            </Button>}

            <h1>
                <Link href="/"><img src={"/images/ediblio_logo.png"}/></Link>
            </h1>

            <div className={styles.rightNav}>
                <SearchBar ref={searchRef} searchOpen={searchOpen || mobileOpen} setSearchOpen={setSearchOpen}
                           searchTerm={searchTerm}
                           setSearchTerm={setSearchTerm} foundRecipes={foundRecipes}/>

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

            <div className={styles.mobileButton}>
                <Button onClick={() => setMobileOpen(v => !v)}>
                    <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars}/>
                </Button>
            </div>

            {navOpen && context.user && <div className={linksContainerClassName}>
                <NavLinks/>
            </div>}
        </nav>
    )
});

export default Header;
