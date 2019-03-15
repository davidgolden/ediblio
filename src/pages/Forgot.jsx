import React from 'react';

const SendEmailForm = (props) => {
  return (
    <div>
      <h1 className='text-center'>Reset Password</h1>
      <form onSubmit={(e) => props.sendResetEmail(e)} className='small-form'>
        <h6>Enter your email, click submit, and we will email you a password reset token. You can use that token to change your password.</h6>
        <div className='form-group'>
        <input className='form-control' type='email' value={props.email} onChange={(e) => props.handleEmailChange(e.target.value)} placeholder='Enter Email'/>
        </div>
        <div className='form-group'>
          <button className='btn btn-lg btn-success' type='submit'>Send Reset Token</button>
        </div>
        <div className='form-group'>
          <button className='btn btn-lg btn-success' type='button' onClick={() => props.changeView('reset')}>Already Have a Token?</button>
        </div>
      </form>
    </div>
  )
}

const ResetPasswordForm = (props) => {
  return (
    <div>
      <form onSubmit={(e) => props.handleReset(e)} className='small-form'>
        <h6>You should have a reset token waiting for you in your inbox. Enter it here along with your new password. Didn't get an email? Try checking your spam folder or resending the email.</h6>
        <div className='form-group'>
          <input className='form-control' type='text' value={props.token} onChange={(e) => props.handleTokenChange(e.target.value)} placeholder='Enter Reset Token'/>
        </div>
        <div className='form-group'>
          <input className='form-control' type='password' value={props.password} onChange={(e) => props.handlePasswordChange(e.target.value)} placeholder='Enter New Password'/>
        </div>
        <div className='form-group'>
          <input className='form-control' type='password' value={props.confirm} onChange={(e) => props.handleConfirmChange(e.target.value)} placeholder='Confirm New Password'/>
        </div>
        <div className='form-group'>
          <button className='btn btn-lg btn-success' type='submit'>Reset Password</button>
        </div>
        <div className='form-group'>
          <button className='btn btn-lg btn-success' type='button' onClick={() => props.changeView('forgot')}>Resend Token</button>
        </div>
      </form>
    </div>
  )
}


class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      view: 'forgot',
      token: '',
      password: '',
      confirm: ''
    }

    this.changeView = (view) => {
      this.setState({view: view})
    }

    this.setView = () => {
      if(this.state.view === 'forgot') {
        return (<SendEmailForm
          sendResetEmail={this.sendResetEmail}
          email={this.state.email}
          handleEmailChange={this.handleEmailChange}
          changeView={this.changeView}
        />)
      }
      else if(this.state.view === 'reset') {
        return (<ResetPasswordForm
          handleReset={this.handleReset}
          token={this.state.token}
          handleTokenChange={this.handleTokenChange}
          password={this.state.password}
          confirm={this.state.confirm}
          handlePasswordChange={this.handlePasswordChange}
          handleConfirmChange={this.handleConfirmChange}
          changeView={this.changeView}
        />)
      }
    }

    this.handleEmailChange = (email) => {
      this.setState({email: email})
    }
    this.handleTokenChange = (token) => {
      this.setState({token: token})
    }
    this.handlePasswordChange = (password) => {
      this.setState({password: password})
    }
    this.handleConfirmChange = (confirm) => {
      this.setState({confirm: confirm})
    }

    this.handleReset = (event) => {
      event.preventDefault();
      if(this.state.password !== this.state.confirm) {
        return alert('Passwords to not match!')
      }

      let xml = new XMLHttpRequest();
      xml.open("POST", "/reset", true);
      xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({token: this.state.token, password: this.state.password}));
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          alert('Successfully updated password!')
          return window.location.reload()
        }
        else if(xml.readyState === 4 && xml.status !== 200){
          return alert(xml.response)
        }
      }
    }


    this.sendResetEmail =(event) => {
      event.preventDefault();
      let xml = new XMLHttpRequest();
      xml.open("POST", "/forgot", true);
      xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xml.setRequestHeader('Access-Control-Allow-Headers', '*');
      xml.setRequestHeader('Access-Control-Allow-Origin', '*');
      xml.send(JSON.stringify({email: this.state.email}));
      xml.onreadystatechange = () => {
        if(xml.readyState === 4 && xml.status === 200) {
          alert(`An email has been sent to ${this.state.email} with further instructions!`)
          return this.setState({view: 'reset'})
        }
        else if(xml.readyState === 4 && xml.status !== 200){
          return alert(xml.response)
        }
      }
    }
  }

  render() {
    return (
      <div>
        {this.setView()}
      </div>
    )
  }

}

export default ForgotPassword
