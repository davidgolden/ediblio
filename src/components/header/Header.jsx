import React from 'react';
import {Link} from "@reach/router"
import {inject, observer} from 'mobx-react';
import classNames from 'classnames';
import styles from './styles/Header.scss';

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

    handleEmailChange = (email) => {
        this.setState({email: email});
    };
    handlePasswordChange = (password) => {
        this.setState({password: password});
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

        return (
            <nav className={navContainerClassName}>
                <a href="/">Recipe Cloud <i className="fas fa-cloud"/></a>

                <ul>
                    {this.props.apiStore.isLoggedIn && <React.Fragment>
                        <li>
                            <Link to={'/'} className={headerLinkClassName}><i
                                className="fas fa-search"/></Link>
                        </li>
                        <li>
                            <Link to={'/groceries'} className={headerLinkClassName}><i
                                className="fas fa-list-ul"/></Link>
                        </li>
                        <li>
                            <Link to={'/add'} className={headerLinkClassName}><i className="fas fa-plus"/></Link>
                        </li>
                        <li>
                            <Link to={`/users/${this.props.apiStore.user._id}/recipes`} className={headerLinkClassName}><i className="fas fa-book"
                                                                                     aria-hidden="true"/></Link>
                        </li>
                    </React.Fragment>}
                    {this.props.apiStore.isLoggedIn ? (<React.Fragment>
                        <li>
                            <Link to={'/user'} className={headerLinkClassName}><i
                                className="fas fa-user"/> {this.props.apiStore.user.username}
                            </Link>
                        </li>
                        <li>
                            <button onClick={this.handleLogout}>Log Out</button>
                        </li>
                    </React.Fragment>) : (<React.Fragment>
                        <li>
                            <input type="email" name="email" placeholder='Email' className=''
                                   value={this.state.email}
                                   onChange={(e) => this.handleEmailChange(e.target.value)}/>
                        </li>
                        <li>
                            <input type="password" name="password" placeholder='Password'
                                   className=''
                                   value={this.state.password}
                                   onChange={(e) => this.handlePasswordChange(e.target.value)}/>
                        </li>
                        <li>
                            <button onClick={this.handleLoginSubmit} value='Login'>Login</button>
                        </li>
                        <li>
                            <Link to={'/forgot'}>Forgot Password?</Link>
                        </li>
                    </React.Fragment>)}
                </ul>
            </nav>
        )
    };
}
