import React from 'react';
import styles from './Popup.module.scss';
import classNames from 'classnames';

export default class Backdrop extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: true,
        }
    }

    close = () => {
        this.setState({
            visible: false,
        })
    };

    render() {
        const backdropClassName = classNames({
            [styles.backdrop]: true,
            [styles.backdropVisible]: this.state.visible,
        });

        return <div className={backdropClassName} />
    }
}
