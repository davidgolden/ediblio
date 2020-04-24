import React, {useContext, useEffect, useState} from 'react';
import {ApiStoreContext} from "../../stores/api_store";
import styles from "./styles/UserWall.module.scss";
import {observer} from "mobx-react";

const UserWall = observer((props) => {
    const context = useContext(ApiStoreContext);

    if (context.loggedIn) {
        return <div>{props.children}</div>
    } else {
        return <div className={styles.container}>You need to be logged in to be here!"</div>
    }
});

export default UserWall;
