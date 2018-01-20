import React from 'react';

class UserProfile extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: props.user.username,
      email: props.user.email,
      password: props.user.password,
      confirm: props.user.password
    }

    this.handleUsernameChange = username => {
      this.setState({username: username})
    }
    this.handleEmailChange = email => {
      this.setState({email: email})
    }
    this.handlePasswordChange = password => {
      this.setState({password: password})
    }
    this.handleConfirmChange = confirm => {
      this.setState({confirm: confirm})
    }
    this.handleSubmit = (event) => {
      event.preventDefault();
      if(this.state.password !== this.state.confirm) {
        return alert('Passwords do not match!')
      } else {
        let xml = new XMLHttpRequest();
        xml.open("POST", `/users/${props.user._id}`, true);
        xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send(JSON.stringify({username: this.state.username, email: this.state.email, password: this.state.password}));
        xml.onreadystatechange = () => {
          if(xml.readyState === 4 && xml.status === 200) {
            return alert('Successfully updated profile!')
          }
          else if(xml.readyState === 4 && xml.status !== 200) {
            return alert(xml.response)
          }
        }
      }
    }
  }

  componentWillMount() {
    let xml = new XMLHttpRequest();
    xml.open("GET", "/authenticate", true);
    xml.setRequestHeader('Access-Control-Allow-Headers', '*');
    xml.setRequestHeader('Access-Control-Allow-Origin', '*');
    xml.send();
    xml.onreadystatechange = () => {
      if(xml.readyState === 4 && xml.status === 200) {
        let res = JSON.parse(xml.response);
        this.setState({username: res.user.username, email: res.user.email, password: res.user.password, confirm: res.user.password});
      }
    }
  }

  render() {
    return (
      <div className='small-form'>
        <h1 className='text-center'>Edit Profile</h1>
        <div className='form-group'>
          <label htmlFor='username'>Username</label>
          <input type='text' className='form-control' name='username' value={this.state.username} onChange={(e) => this.handleUsernameChange(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='email'>Email</label>
          <input type='email' className='form-control' name='email' value={this.state.email} onChange={(e) => this.handleEmailChange(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='password'>Password</label>
          <input type='password' className='form-control' name='password' value={this.state.password} onChange={(e) => this.handlePasswordChange(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='confirm'>Confirm Password</label>
          <input type='password' className='form-control' name='confirm' value={this.state.confirm} onChange={(e) => this.handleConfirmChange(e.target.value)} />
        </div>
        <div className='form-group'>
          <button onClick={this.handleSubmit} className='btn btn-md btn-success'>Submit</button>
        </div>
      </div>
    )
  }
}

export default UserProfile;
