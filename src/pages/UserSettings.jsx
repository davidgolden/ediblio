import React from 'react';
import {inject, observer} from 'mobx-react';

@inject('apiStore')
@observer
export default class UserSettings extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            username: props.apiStore.user ? props.apiStore.user.username : '',
            email: props.apiStore.user ? props.apiStore.user.email : '',
            password: props.apiStore.user ? props.apiStore.user.password : '',
            confirm: props.apiStore.user ? props.apiStore.user.password : '',
        }
    }

    handleUsernameChange = e => {
        this.setState({username: e.target.value})
    };

    handleEmailChange = e => {
        this.setState({email: e.target.value})
    };

    handlePasswordChange = e => {
        this.setState({password: e.target.value})
    };

    handleConfirmChange = e => {
        this.setState({confirm: e.target.value})
    };

    handleSubmit = () => {
        if (this.state.password !== this.state.confirm) {
            return alert('Passwords do not match!')
        } else {
            this.props.apiStore.patchUser({
                username: this.state.username,
                email: this.state.email,
                password: this.state.password
            });
        }
    };

    render() {
        return (
            <div className='small-form'>
                <h1 className='text-center'>Edit Profile</h1>
                <div className='form-group'>
                    <label htmlFor='username'>Username</label>
                    <input type='text' className='form-control' name='username' value={this.state.username}
                           onChange={this.handleUsernameChange}/>
                </div>
                <div className='form-group'>
                    <label htmlFor='email'>Email</label>
                    <input type='email' className='form-control' name='email' value={this.state.email}
                           onChange={this.handleEmailChange}/>
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password</label>
                    <input type='password' className='form-control' name='password' value={this.state.password}
                           onChange={this.handlePasswordChange}/>
                </div>
                <div className='form-group'>
                    <label htmlFor='confirm'>Confirm Password</label>
                    <input type='password' className='form-control' name='confirm' value={this.state.confirm}
                           onChange={this.handleConfirmChange}/>
                </div>
                <div className='form-group'>
                    <button onClick={this.handleSubmit} className='btn btn-md btn-success'>Submit</button>
                </div>
            </div>
        )
    }
}
