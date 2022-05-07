import React, {useState, useContext, useEffect, useRef} from 'react';
import classNames from 'classnames';
import styles from './styles/Header.module.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronDown, faBars, faTimes
} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import Link from "next/link";
import {observer} from "mobx-react";
import useDebounce from "../../hooks/useDebounce";
import {CSSTransition} from "react-transition-group";
import UserImageSmall from "../users/UserImageSmall";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";

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

const Header = observer((props) => {
    const [navOpen, setNavOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [foundRecipes, setFoundRecipes] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);

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
        [styles.userLinkLogin]: !context.loggedIn,
    });

    return (
        <>
            <nav className={navContainerClassName}>
                <CSSTransition in={mobileOpen} classNames={mobileTransition} timeout={500}>
                    <div className={styles.mobileMenu}>
                        <SearchBar ref={searchRef} searchOpen={false} setSearchOpen={setSearchOpen}
                                   searchTerm={searchTerm}
                                   setSearchTerm={setSearchTerm} foundRecipes={foundRecipes}/>
                        {context.loggedIn ? <NavLinks/> : <div>
                            <button className={userLinkClassName} onClick={() => context.addModal("login")}>
                                Login
                            </button>
                        </div>}
                    </div>
                </CSSTransition>

                {typeof window !== 'undefined' && window.history.length > 1 &&
                <Button className={styles.backButton} onClick={() => window.history.back()}>
                    <FontAwesomeIcon icon={faChevronLeft}/>
                </Button>}

                <h1>
                    <Link href={"/"}><img src={"/images/ediblio_logo.png"}/></Link>
                </h1>

                <div className={styles.rightNav}>
                    <SearchBar ref={searchRef} searchOpen={searchOpen || mobileOpen} setSearchOpen={setSearchOpen}
                               searchTerm={searchTerm}
                               setSearchTerm={setSearchTerm} foundRecipes={foundRecipes}/>

                    {context.loggedIn ?
                        <div onMouseEnter={() => setNavOpen(true)} onMouseLeave={() => setNavOpen(false)}
                             className={userLinkClassName}>
                            <UserImageSmall size={35} profileImage={context.user.profile_image}/>
                            <FontAwesomeIcon icon={faChevronDown}/>
                            {navOpen && context.loggedIn && <div className={linksContainerClassName}>
                                <NavLinks/>
                            </div>}
                        </div>
                        : <button className={userLinkClassName} onClick={() => context.addModal("login")}>
                            Login
                        </button>}
                </div>

                <div className={styles.mobileButton}>
                    <Button onClick={() => setMobileOpen(v => !v)}>
                        <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars}/>
                    </Button>
                </div>
            </nav>
        </>
    )
});

export default Header;
