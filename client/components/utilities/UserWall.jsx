import React, {useContext} from 'react';
import {ApiStoreContext} from "../../stores/api_store";
import styles from "./styles/UserWall.module.scss";

export default function UserWall(props) {
    const context = useContext(ApiStoreContext);
    const [didMount, setDidMount] = React.useState(false);
    React.useLayoutEffect(() => setDidMount(true), []);

    if (didMount && !context.user) {
        return <div className={styles.container}>You need to be logged in to be here!</div>
    }

    return <div>{props.children}</div>;
}
