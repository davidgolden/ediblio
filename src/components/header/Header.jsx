import React from 'react';
import {Link} from "@reach/router"
import {inject, observer} from 'mobx-react';
import classNames from 'classnames';
import styles from './styles/Header.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faCloud, faSearch, faListUl, faPlus, faBook, faUser } from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";

@inject('apiStore')
@observer
export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
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

        return (
            <nav className={navContainerClassName}>
                <h1>
                    <a href="/">Recipe Cloud <FontAwesomeIcon icon={faCloud}/></a>
                </h1>

                <ul>
                    {this.props.apiStore.isLoggedIn && <React.Fragment>
                        <li>
                            <Link to={'/'} className={headerLinkClassName}>
                                <FontAwesomeIcon icon={faSearch}/>
                            </Link>
                        </li>
                        <li>
                            <Link to={`/users/${this.props.apiStore.user._id}/groceries`} className={headerLinkClassName}>
                                <FontAwesomeIcon icon={faListUl}/>
                            </Link>
                        </li>
                        <li>
                            <Link to={'/add'} className={headerLinkClassName}>
                                <FontAwesomeIcon icon={faPlus}/>
                            </Link>
                        </li>
                        <li>
                            <Link to={`/users/${this.props.apiStore.user._id}/recipes`} className={headerLinkClassName}>
                                <FontAwesomeIcon icon={faBook}/>
                            </Link>
                        </li>
                    </React.Fragment>}
                    {this.props.apiStore.isLoggedIn ? (<React.Fragment>
                        <li className={userLinkClassName}>
                            <Link to={`/users/${this.props.apiStore.user._id}/settings`}>
                                <FontAwesomeIcon icon={faUser}/> <span>{this.props.apiStore.user.username}</span>
                            </Link>
                        </li>
                        <li className={logoutClassName}>
                            <Button onClick={this.handleLogout}>Log Out</Button>
                        </li>
                    </React.Fragment>) : (<React.Fragment>
                        <li>
                            <input type="email" name="email" placeholder='Email' className=''
                                   value={this.state.email}
                                   onChange={this.handleEmailChange}/>
                        </li>
                        <li>
                            <input type="password" name="password" placeholder='Password'
                                   value={this.state.password}
                                   onChange={this.handlePasswordChange}/>
                        </li>
                        <li className={logoutClassName}>
                            <Button onClick={this.handleLoginSubmit} value='Login'>Login</Button>
                        </li>
                        <li className={userLinkClassName}>
                            <Link to={'/forgot'}>Forgot Password?</Link>
                            <Link to={'/register'}>Register</Link>
                        </li>
                    </React.Fragment>)}
                </ul>
            </nav>
        )
    };
}
