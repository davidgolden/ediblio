import React from 'react';
import classNames from 'classnames';
import styles from './styles/Landing.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCloudUploadAlt, faSearchPlus, faListOl, faShoppingCart} from '@fortawesome/free-solid-svg-icons'
import Button from "../components/utilities/buttons/Button";
import {inject, observer} from 'mobx-react';
import {navigate, redirectTo} from '@reach/router';

@inject('apiStore')
@observer
export default class Landing extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            email: '',
            password: '',
            confirm: ''
        }
    }

    handleUsernameChange = e => {
        this.setState({username: e.target.value})
    }
    handleEmailChange = e => {
        this.setState({email: e.target.value})
    }
    handlePasswordChange = e => {
        this.setState({password: e.target.value})
    }
    handleConfirmChange = e => {
        this.setState({confirm: e.target.value})
    }

    handleSubmit = () => {
        if (this.state.password !== this.state.confirm) {
            return alert('Passwords do not match!')
        }
        this.props.apiStore.registerUser({
            username: this.state.username,
            email: this.state.email,
            password: this.state.password
        })
            .then(() => {
                this.props.navigate("/")
            })
    };

    render() {
        const landingContainerClassName = classNames({
            [styles.landingContainer]: true,
        });
        const infoContainerClassName = classNames({
            [styles.infoContainer]: true,
        });
        const signupContainerClassName = classNames({
            [styles.signupContainer]: true,
        });
        const infoBoxClassName = classNames({
            [styles.infoBox]: true,
        });
        const infoBlockClassName = classNames({
            [styles.infoBlock]: true,
        });
        const submitButtonClassName = classNames({
            [styles.submitButton]: true,
            [styles.submitButtonDisabled]: !(this.state.username && this.state.email && this.state.password && this.state.confirm)
        })

        return (
            <div className={landingContainerClassName}>
                <div className={infoContainerClassName}>

                    <div className={infoBoxClassName}>
                        <FontAwesomeIcon icon={faCloudUploadAlt}/>
                        <h6><span className={infoBlockClassName}>Add recipes</span> to your recipe cloud, then easily
                            populate your grocery list with their ingredients.</h6>
                    </div>
                    <div className={infoBoxClassName}>
                        <FontAwesomeIcon icon={faSearchPlus}/>
                        <h6><span className={infoBlockClassName}>Browse yours</span> or others&#39; recipes by tag, then
                            easily add those recipes to your recipe cloud.</h6>
                    </div>

                    <div className={infoBoxClassName}>
                        <FontAwesomeIcon icon={faListOl}/>
                        <h6><span className={infoBlockClassName}>Add ingredients</span> to your list and recipes to your
                            menu with a single click. Duplicate ingredients are automatically totaled.</h6>
                    </div>
                    <div className={infoBoxClassName}>
                        <FontAwesomeIcon icon={faShoppingCart}/>
                        <h6><span className={infoBlockClassName}>Switch to store mode</span> to view and delete
                            ingredients on your phone as you shop.</h6>
                    </div>
                </div>
                <div className={signupContainerClassName}>
                    <h1>Create an Account</h1>
                    <h6>It's free and your information will stay private.</h6>
                    <div>
                        <input type='text' value={this.state.username} name='username'
                               onChange={this.handleUsernameChange}
                               placeholder='Choose a Username'/>
                    </div>
                    <div>
                        <input type='email' value={this.state.email} name='email' onChange={this.handleEmailChange}
                               placeholder='Email (used for login)'/>
                    </div>
                    <div>
                        <input type='password' id='password' placeholder='Password' onChange={this.handlePasswordChange}
                               name='password' value={this.state.password}/>
                    </div>
                    <div>
                        <input type='password' id='confirm' onChange={this.handleConfirmChange}
                               placeholder='Confirm Password' value={this.state.confirm}/>
                    </div>
                    <div>
                        <Button className={submitButtonClassName} onClick={this.handleSubmit}>Create Account</Button>
                    </div>
                </div>
            </div>
        )
    }
}
