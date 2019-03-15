import React from 'react';
import classNames from 'classnames';
import styles from './styles/Landing.scss';

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

    handleUsernameChange = (username) => {
        this.setState({username: username})
    }
    handleEmailChange = (email) => {
        this.setState({email: email})
    }
    handlePasswordChange = (password) => {
        this.setState({password: password})
    }
    handleConfirmChange = (confirm) => {
        this.setState({confirm: confirm})
    }
    handleSubmit = () => {
        if (this.state.password !== this.state.confirm) {
            return alert('Passwords do not match!')
        }
        let xml = new XMLHttpRequest();
        xml.open("POST", "/users", true);
        xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xml.setRequestHeader('Access-Control-Allow-Headers', '*');
        xml.setRequestHeader('Access-Control-Allow-Origin', '*');
        xml.send(JSON.stringify({
            username: this.state.username,
            email: this.state.email,
            password: this.state.password
        }));
        console.log(xml.statusText)
        xml.onreadystatechange = () => {
            if (xml.readyState === 4 && xml.status === 200) {
                alert(`Welcome to Recipe Cloud, ${this.state.username}`)
                return window.location.reload()
            }
            else if (xml.readyState === 4 && xml.status !== 200) {
                return alert(xml.response)
            }
        }
    }

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

        return (
            <div className={landingContainerClassName}>
                <div className={infoContainerClassName}>

                    <div className={infoBoxClassName}>
                        <i className="fas fa-cloud-upload-alt"/>
                        <h6><span className={infoBlockClassName}>Add recipes</span> to your recipe cloud, then easily
                            populate your grocery list with their ingredients.</h6>
                    </div>
                    <div className={infoBoxClassName}>
                        <i className="fas fa-search-plus"/>
                        <h6><span className={infoBlockClassName}>Browse yours</span> or others&#39; recipes by tag, then
                            easily add those recipes to your recipe cloud.</h6>
                    </div>

                    <div className={infoBoxClassName}>
                        <i className="fas fa-list-ol"/>
                        <h6><span className={infoBlockClassName}>Add ingredients</span> to your list and recipes to your
                            menu with a single click. Duplicate ingredients are automatically totaled.</h6>
                    </div>
                    <div className={infoBoxClassName}>
                        <i className="fas fa-shopping-cart"/>
                        <h6><span className={infoBlockClassName}>Switch to store mode</span> to view and delete
                            ingredients on your phone as you shop.</h6>
                    </div>
                </div>
                <div className={signupContainerClassName}>
                    <h1>Create an Account</h1>
                    <h6>It's free and your information will stay private.</h6>
                    <div>
                        <input type='text' required name='username' onChange={this.handleUsernameChange}
                               placeholder='Choose a Username' className='form-control'/>
                    </div>
                    <div>
                        <input type='email' required name='email' onChange={this.handleEmailChange}
                               placeholder='Email (used for login)' className='form-control'/>
                    </div>
                    <div>
                        <input type='password' id='password' placeholder='Password' onChange={this.handlePasswordChange}
                               className='form-control' name='password' required/>
                    </div>
                    <div>
                        <input type='password' id='confirm' onChange={this.handleConfirmChange}
                               placeholder='Confirm Password' className='form-control' required/>
                    </div>
                    <div>
                        <button onClick={this.handleSubmit}>Create Account</button>
                    </div>
                </div>
            </div>
        )
    }
}
