import React from 'react';
import {Link} from "@reach/router"
import {inject, observer} from 'mobx-react';

const NavLinks = () => {
    return (
        <div className='nav-div'>
            <li className="">
                <Link to={'/browse'}><i className="fas fa-search"/></Link>
            </li>
            <li>
                <Link to={'/groceries'}><i className="fas fa-list-ul"/></Link>
            </li>
            <li>
                <Link to={'/add'}><i className="fas fa-plus"/></Link>
            </li>
            <li className="">
                <Link to={'/recipes'}><i className="fas fa-book" aria-hidden="true"/></Link>
            </li>
        </div>
    )
};

const LoginLinks = (props) => {
    return (
        <form id='login-form' className="small-form nav-div" onSubmit={props.handleLoginSubmit}>
            <div className='nav-div'>
                <li className="">
                    <input type="email" required name="email" placeholder='Email' className='' value={props.email}
                           onChange={(e) => props.handleEmailChange(e.target.value)}/>
                </li>
                <li className="">
                    <input type="password" required name="password" placeholder='Password' className=''
                           value={props.password} onChange={(e) => props.handlePasswordChange(e.target.value)}/>
                    <Link to={'/forgot'} className='forgot-password'>Forgot Password?</Link>
                </li>
                <li className=''>
                    <input type='submit' value='Login'/>
                </li>
            </div>
        </form>
    )
}

const LogoutLinks = (props) => {
    var iconStyle = {
        color: 'white'
    };
    return (
        <div className='nav-div'>
            <li className="">
                <Link to={'/user'}><i className="fas fa-user" style={iconStyle}/> {props.user.username}</Link>
            </li>
            <li className="">
                <button className='' onClick={props.handleLogout}>Log Out</button>
            </li>
        </div>
    )
};

export default
@inject('apiStore')
@observer
class Header extends React.Component {
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

    handleLoginSubmit = (event) => {
        event.preventDefault();
        this.props.apiStore.userLogin(this.state.email, this.state.password);
    };

    handleLogout = () => {
        this.props.apiStore.userLogout();
    };

    componentDidMount() {
        this.props.apiStore.authenticate();
    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light">
                <a className="navbar-brand" href="/">Recipe Cloud <i className="fas fa-cloud"/></a>
                <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"/>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className='navbar-nav mr-auto'>

                    </ul>
                    <ul className="navbar-nav navbar-right">
                        {this.props.apiStore.isLoggedIn && <NavLinks/>}
                        {this.props.apiStore.isLoggedIn ? (
                            <LogoutLinks
                                handleLogout={this.handleLogout}
                                user={this.props.apiStore.user}
                            />) : (
                            <LoginLinks
                                email={this.state.email}
                                password={this.state.password}
                                handleEmailChange={this.handleEmailChange}
                                handlePasswordChange={this.handlePasswordChange}
                                handleLoginSubmit={this.handleLoginSubmit}
                            />)}
                    </ul>
                </div>
            </nav>
        )
    };
}
