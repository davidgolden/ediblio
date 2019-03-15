import React from 'react';
import { Link } from "@reach/router"

const NavLinks = () => {
  return (
    <div className='nav-div'>
      <li className="">
          <Link to={'/browse'}><i className="fas fa-search" /></Link>
      </li>
      <li>
          <Link to={'/groceries'}><i className="fas fa-list-ul" /></Link>
      </li>
      <li>
          <Link to={'/add'}><i className="fas fa-plus" /></Link>
      </li>
      <li className="">
          <Link to={'/recipes'}><i className="fas fa-book" aria-hidden="true" /></Link>
      </li>
    </div>
  )
}

const LoginLinks = (props) => {
  return (
    <form id='login-form' className="small-form nav-div" onSubmit={props.handleLoginSubmit}>
    <div className='nav-div'>
      <li className="">
          <input type="email" required name="email" placeholder='Email' className='' value={props.email} onChange={(e) => props.handleEmailChange(e.target.value)}/>
      </li>
      <li className="">
          <input type="password" required name="password" placeholder='Password' className='' value={props.password} onChange={(e) => props.handlePasswordChange(e.target.value)}/>
          <Link to={'/forgot'} className='forgot-password'>Forgot Password?</Link>
        </li>
      <li className=''>
          <input type='submit' value='Login' />
      </li>
    </div>
  </form>
  )
}

const LogoutLinks = (props) => {
  var iconStyle = {
    color: 'white'
  }
  return (
    <div className='nav-div'>
      <li className="">
          <Link to={'/user'}><i className="fas fa-user" style={iconStyle} /> {props.user.username}</Link>
      </li>
      <li className="">
          <button className='' onClick={props.handleLogout}>Log Out</button>
      </li>
    </div>
  )
}

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    }

    this.handleEmailChange = (email) => {
      this.setState({email: email});
    }
    this.handlePasswordChange = (password) => {
      this.setState({password: password});
    }

    this.handleLoginSubmit = (event) => {
      event.preventDefault();
      let xml = new XMLHttpRequest();
      xml.open("POST", "/login", true);
      xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({email: this.state.email, password: this.state.password}));
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          let res = JSON.parse(xml.response);
          return props.setLoginState(true, res.user);
        }
        else if(xml.readyState === 4 && xml.status !== 200) {
          return alert(xml.response)
        }
      }
    }

    this.handleLogout = () => {
      let xml = new XMLHttpRequest();
      xml.open("GET", "/logout", true);
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send();
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          props.setLoginState(false, {});
        }
      }
    }
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light">
        <a className="navbar-brand" href="/">Recipe Cloud <i className="fas fa-cloud" /></a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className='navbar-nav mr-auto'>

            </ul>
            <ul className="navbar-nav navbar-right">
              {this.props.loggedIn && <NavLinks />}
                {this.props.loggedIn ? (
                  <LogoutLinks
                    handleLogout={this.handleLogout}
                    user={this.props.user}
                    /> ) : (
                      <LoginLinks
                        email={this.state.email}
                        password={this.state.password}
                        handleEmailChange={this.handleEmailChange}
                        handlePasswordChange={this.handlePasswordChange}
                        handleLoginSubmit={this.handleLoginSubmit}
                      />) }
            </ul>
      </div>
    </nav>
    )};
  }


export default Header;
