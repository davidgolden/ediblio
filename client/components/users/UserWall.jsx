import React, {useContext} from 'react';
import {ApiStoreContext} from "../../stores/api_store";
import styles from "./styles/UserWall.module.scss";
import {observer} from "mobx-react";

const UserWall = observer((props) => {
    const context = useContext(ApiStoreContext);

    if (!context.loggedIn) {
        return <div className={styles.container}>You need to be logged in to be here!</div>
    }

    return <div>{props.children}</div>;
});

export default UserWall;
