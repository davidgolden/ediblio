import React from 'react';
import {inject, observer} from 'mobx-react';
import styles from './styles/UserSettings.scss';
import classNames from 'classnames';
import Button from "../components/utilities/buttons/Button";

@inject('apiStore')
@observer
export default class UserSettings extends React.Component {
    constructor(props) {
        super(props);

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

    componentDidMount() {
        this.props.apiStore.getUser(this.props.user_id)
            .then(user => {
                this.setState({
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    confirm: user.password,
                })
            })
    }

    render() {

        if (!this.props.apiStore.isLoggedIn || this.props.apiStore.user._id !== this.props.user_id) {
            return <p>You do not have permission to view this page!</p>
        }

        const settingsContainerClassName = classNames({
            [styles.settingsContainer]: true,
        });

        return (
            <div className={settingsContainerClassName}>
                <h1>Edit Profile</h1>
                <div>
                    <label htmlFor='username'>Username</label>
                    <input type='text' name='username' value={this.state.username}
                           onChange={this.handleUsernameChange}/>
                </div>
                <div>
                    <label htmlFor='email'>Email</label>
                    <input type='email' name='email' value={this.state.email}
                           onChange={this.handleEmailChange}/>
                </div>
                <div>
                    <label htmlFor='password'>Password</label>
                    <input type='password' name='password' value={this.state.password}
                           onChange={this.handlePasswordChange}/>
                </div>
                <div>
                    <label htmlFor='confirm'>Confirm Password</label>
                    <input type='password' name='confirm' value={this.state.confirm}
                           onChange={this.handleConfirmChange}/>
                </div>
                <div>
                    <Button onClick={this.handleSubmit}>Submit</Button>
                </div>
            </div>
        )
    }
}
