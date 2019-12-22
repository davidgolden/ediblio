import React, { useContext } from 'react';
import classNames from 'classnames';
import styles from './styles/Notification.scss';
import PropTypes from 'prop-types';
import {ApiStoreContext} from "../../stores/api_store";

const Notification = () => {
    const context = useContext(ApiStoreContext);

    const notificationClassName = classNames({
        [styles.notification]: true,
        [styles.notificationError]: context.notificationMessage && context.notificationType === 'error',
        [styles.notificationSuccess]: context.notificationMessage && context.notificationType === 'success',
    });

    return (
        <div className={notificationClassName}>
            {context.notificationMessage}
        </div>
    );
};

Notification.propTypes = {
    error: PropTypes.string,
};

export default Notification;
