import React, {useContext} from 'react';
import {ApiStoreContext} from "../../stores/api_store";
import styles from "./styles/UserWall.scss";

export default function UserWall(props) {
    const context = useContext(ApiStoreContext);

    if (!context.user) {
        return <div className={styles.container}>You need to be logged in to be here!</div>
    }

    return props.children;
}
