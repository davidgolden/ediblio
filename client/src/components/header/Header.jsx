import React, { useState, useContext } from 'react';
import {Link} from "@reach/router"
import classNames from 'classnames';
import styles from './styles/Header.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCloud, faSearch, faListUl, faPlus, faBook, faUser, faHamburger} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";
import {ApiStoreContext} from "../../stores/api_store";

const Header = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showNav, setShowNav] = useState(false);

    const context = useContext(ApiStoreContext);

    const handleEmailChange = e => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = e => {
        setPassword(e.target.value);
    handleLoginSubmit = e => {
        e.preventDefault();
        this.props.apiStore.userLogin(this.state.email, this.state.password);
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
                <a href="/">Recipe Cloud <FontAwesomeIcon icon={faCloud}/></a>
            </h1>

            <Button onClick={toggleNav} className={mobileHamClassName}>
                <FontAwesomeIcon icon={faHamburger}/>
            </Button>

            <div className={linksContainerClassName}>
                {context.isLoggedIn ? <React.Fragment>
                        <ul>
                            <li>
                                <Link to={'/'} className={headerLinkClassName}>
                                    <FontAwesomeIcon icon={faSearch}/>
                                </Link>
                            </li>
                            <li>
                                <Link to={`/users/${context.user._id}/groceries`}
                                      className={headerLinkClassName}>
                                    <FontAwesomeIcon icon={faListUl}/>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/add'} className={headerLinkClassName}>
                                    <FontAwesomeIcon icon={faPlus}/>
                                </Link>
                            </li>
                            <li>
                                <Link to={`/users/${context.user._id}/recipes`}
                                      className={headerLinkClassName}>
                                    <FontAwesomeIcon icon={faBook}/>
                                </Link>
                            </li>
                        </ul>
                        <Link className={userLinkClassName} to={`/users/${context.user._id}/settings`}>
                            <FontAwesomeIcon icon={faUser}/> <span>{context.user.username}</span>
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

                        <Link className={userLinkClassName} to={'/forgot'}>Forgot Password?</Link>
                        <Link className={userLinkClassName} to={'/register'}>Register</Link>
                    </React.Fragment>}
            </div>
        </nav>
    )
};

export default Header;
