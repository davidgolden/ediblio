import React, {useState, useContext} from 'react';
import classNames from 'classnames';
import styles from './styles/Header.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCloud, faSearch, faListUl, faPlus, faBook, faUser, faHamburger} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";
import Link from "next/link";
import {observer} from "mobx-react";

const Header = observer((props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showNav, setShowNav] = useState(false);

    const context = useContext(ApiStoreContext);

    const handleEmailChange = e => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = e => {
        setPassword(e.target.value);
    };

    const handleLoginSubmit = () => {
        context.userLogin(email, password);
    };

    const toggleNav = () => {
        setShowNav(!showNav);
    };

    const navContainerClassName = classNames({
        [styles.navContainer]: true,
    });
    const headerLinkClassName = classNames({
        [styles.headerLink]: true,
    });
    const userLinkClassName = classNames({
        [styles.userLink]: true,
    });
    const logoutClassName = classNames({
        [styles.logout]: true,
    });
    const linksContainerClassName = classNames({
        [styles.linksContainer]: true,
        [styles.linksContainerVisible]: showNav,
    });
    const mobileHamClassName = classNames({
        [styles.mobileHam]: true,
    });

    return (
        <nav className={navContainerClassName}>
            <h1>
                <a href="/"><h1>Recipe Cloud</h1> <FontAwesomeIcon icon={faCloud}/></a>
            </h1>

            <Button onClick={toggleNav} className={mobileHamClassName}>
                <FontAwesomeIcon icon={faHamburger}/>
            </Button>

            <div className={linksContainerClassName}>
                {context.user ? <React.Fragment>
                        <Link href={'/'}>
                            <a className={headerLinkClassName}>
                                <FontAwesomeIcon icon={faSearch}/>
                            </a>
                        </Link>
                        <Link href={`/users/${context.user._id}/groceries`}>
                            <a className={headerLinkClassName}>
                                <FontAwesomeIcon icon={faListUl}/>
                            </a>
                        </Link>
                        <Link href={'/add'}>
                            <a className={headerLinkClassName}>
                                <FontAwesomeIcon icon={faPlus}/>
                            </a>
                        </Link>
                        <Link href={`/users/${context.user._id}/recipes`}>
                            <a className={headerLinkClassName}>
                                <FontAwesomeIcon icon={faBook}/>
                            </a>
                        </Link>
                        <Link href={`/users/${context.user._id}/settings`}>
                            <a className={userLinkClassName}>
                                <FontAwesomeIcon icon={faUser}/> <span>{context.user.username}</span>
                            </a>
                        </Link>
                        <Button className={logoutClassName} onClick={context.userLogout}>Log Out</Button>
                    </React.Fragment> :
                    <React.Fragment>
                        <input type="email" name="email" placeholder='Email'
                               value={email}
                               onChange={handleEmailChange}/>
                        <input type="password" name="password" placeholder='Password'
                               value={password}
                               onChange={handlePasswordChange}/>
                        <Button className={logoutClassName} onClick={handleLoginSubmit}
                                value='Login'>Login</Button>

                        <Link href={'/forgot'}>
                            <a className={userLinkClassName}>
                                Forgot Password?
                            </a>
                        </Link>
                        <Link href={'/register'}>
                            <a className={userLinkClassName}>
                                Register
                            </a>
                        </Link>
                    </React.Fragment>}
            </div>
        </nav>
    )
});

export default Header;