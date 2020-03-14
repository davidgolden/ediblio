import React, { useContext } from 'react';
import classNames from 'classnames';
import styles from './styles/Notification.module.scss';
import PropTypes from 'prop-types';
import {ApiStoreContext} from "../../stores/api_store";
import {observer} from "mobx-react";

const Notification = observer(() => {
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
});

Notification.propTypes = {
    error: PropTypes.string,
};

export default Notification;
