import React from 'react';
import {Link} from "@reach/router"
import {inject, observer} from 'mobx-react';
import classNames from 'classnames';
import styles from './styles/Header.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCloud, faSearch, faListUl, faPlus, faBook, faUser, faHamburger} from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";

@inject('apiStore')
@observer
export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            showNav: false,
        }
    }

    handleEmailChange = e => {
        this.setState({email: e.target.value});
    };
    handlePasswordChange = e => {
        this.setState({password: e.target.value});
    };

    handleLoginSubmit = () => {
        this.props.apiStore.userLogin(this.state.email, this.state.password);
    };

    handleLogout = () => {
        this.props.apiStore.userLogout();
    };

    toggleNav = () => {
        this.setState(prevState => {
            return {
                showNav: !prevState.showNav,
            }
        })
    };

    componentDidMount() {
        this.props.apiStore.authenticate();
    }

    render() {
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
            [styles.linksContainerVisible]: this.state.showNav,
        });
        const mobileHamClassName = classNames({
            [styles.mobileHam]: true,
        });

        return (
            <nav className={navContainerClassName}>
                <h1>
                    <a href="/">Recipe Cloud <FontAwesomeIcon icon={faCloud}/></a>
                </h1>

                <Button onClick={this.toggleNav} className={mobileHamClassName}>
                    <FontAwesomeIcon icon={faHamburger}/>
                </Button>

                <div className={linksContainerClassName}>
                    {this.props.apiStore.isLoggedIn ? <React.Fragment>
                            <ul>
                                <li>
                                    <Link to={'/'} className={headerLinkClassName}>
                                        <FontAwesomeIcon icon={faSearch}/>
                                    </Link>
                                </li>
                                <li>
                                    <Link to={`/users/${this.props.apiStore.user._id}/groceries`}
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
                                    <Link to={`/users/${this.props.apiStore.user._id}/recipes`}
                                          className={headerLinkClassName}>
                                        <FontAwesomeIcon icon={faBook}/>
                                    </Link>
                                </li>
                            </ul>
                            <Link className={userLinkClassName} to={`/users/${this.props.apiStore.user._id}/settings`}>
                                <FontAwesomeIcon icon={faUser}/> <span>{this.props.apiStore.user.username}</span>
                            </Link>
                            <Button className={logoutClassName} onClick={this.handleLogout}>Log Out</Button>
                        </React.Fragment> :
                        <React.Fragment>
                            <input type="email" name="email" placeholder='Email'
                                   value={this.state.email}
                                   onChange={this.handleEmailChange}/>
                            <input type="password" name="password" placeholder='Password'
                                   value={this.state.password}
                                   onChange={this.handlePasswordChange}/>
                            <Button className={logoutClassName} onClick={this.handleLoginSubmit}
                                    value='Login'>Login</Button>

                            {/*<Link className={userLinkClassName} to={'/forgot'}>Forgot Password?</Link>*/}
                            <Link className={userLinkClassName} to={'/register'}>Register</Link>
                        </React.Fragment>}
                </div>
            </nav>
        )
    };
}
