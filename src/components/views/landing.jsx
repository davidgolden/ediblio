import React from 'react';


const Info = () => {
  return (
    <div className='info-container'>

        <div className='info-box'>
          <i className="fas fa-cloud-upload-alt info-icon"></i>
          <h6><span className='info-block'>Add recipes</span> to your recipe cloud, then easily populate your grocery list with their ingredients.</h6>
        </div>
        <div className='info-box'>
          <i className="fas fa-search-plus info-icon"></i>
          <h6><span className='info-block'>Browse yours</span> or others&#39; recipes by tag, then easily add those recipes to your recipe cloud.</h6>
        </div>

        <div className='info-box'>
          <i className="fas fa-list-ol info-icon"></i>
          <h6><span className='info-block'>Add ingredients</span> to your list and recipes to your menu with a single click. Duplicate ingredients are automatically totaled.</h6>
        </div>
        <div className='info-box'>
          <i className="fas fa-shopping-cart info-icon"></i>
          <h6><span className='info-block'>Switch to store mode</span> to view and delete ingredients on your phone as you shop.</h6>
        </div>
      </div>

  )
}

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      email: '',
      password: '',
      confirm: ''
    }

    this.handleUsernameChange = (username) => {
      this.setState({username: username})
    }
    this.handleEmailChange = (email) => {
      this.setState({email: email})
    }
    this.handlePasswordChange = (password) => {
      this.setState({password: password})
    }
    this.handleConfirmChange = (confirm) => {
      this.setState({confirm: confirm})
    }
    this.handleSubmit = (event) => {
      event.preventDefault();
      if(this.state.password !== this.state.confirm) {
        return alert('Passwords do not match!')
      }
      let xml = new XMLHttpRequest();
      xml.open("POST", "/users", true);
      xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({username: this.state.username, email: this.state.email, password: this.state.password}));
      console.log(xml.statusText)
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          alert(`Welcome to Recipe Cloud, ${this.state.username}`)
          return window.location.reload()
        }
        else if(xml.readyState === 4 && xml.status !== 200) {
          return alert(xml.response)
        }
      }
    }
  }


  render() {
    return (
      <form onSubmit={this.handleSubmit} id='signupform'>
          <h1>Create an Account</h1>
          <h6>It's free and your information will stay private.</h6>
        <div className='form-group'>
          <input type='text' required name='username' onChange={(e) => this.handleUsernameChange(e.target.value)} placeholder='Choose a Username' className='form-control'></input>
        </div>
        <div className='form-group'>
          <input type='email' required name='email' onChange={(e) => this.handleEmailChange(e.target.value)} placeholder='Email (used for login)' className='form-control'></input>
        </div>
        <div className='form-group'>
          <input type='password' id='password' placeholder='Password' onChange={(e) => this.handlePasswordChange(e.target.value)} className='form-control' name='password' required></input>
        </div>
        <div className='form-group'>
          <input type='password' id='confirm' onChange={(e) => this.handleConfirmChange(e.target.value)} placeholder='Confirm Password' className='form-control' required></input>
        </div>
        <div className='form-group'>
          <button type='submit' className='btn btn-lg btn-success'>Create Account</button>
        </div>
      </form>
    )
  }

}

const Landing = (props) => (
  <div className='landing-container'>
      <Info />
    <div className='signup-container'>
      <SignUpForm />
    </div>
  </div>
);

export default Landing;
