import React from 'react';
import classNames from 'classnames';
import styles from './styles/Notification.scss';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

@inject('apiStore')
@observer
export default class Notification extends React.Component {
    static propTypes = {
        error: PropTypes.string,
    };

    render() {
        const { apiStore } = this.props;

        const notificationClassName = classNames({
            [styles.notification]: true,
            [styles.notificationError]: apiStore.notificationMessage && apiStore.notificationType === 'error',
            [styles.notificationSuccess]: apiStore.notificationMessage && apiStore.notificationType === 'success',
        });

        return (
            <div className={notificationClassName}>
                {apiStore.notificationMessage}
            </div>
        );
    }
}
