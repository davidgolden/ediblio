import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import Link from "next/link";
import DeleteButton from "./utilities/buttons/DeleteButton";
import styles from './styles/CollectionCard.scss';
import {observer} from "mobx-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import Button from "./utilities/buttons/Button";
import UserImageSmall from "./utilities/UserImageSmall";
import {ApiStoreContext} from "../stores/api_store";
import RemoveButton from "./utilities/buttons/RemoveButton";

const CollectionCard = observer((props) => {
    const [didMount, setDidMount] = React.useState(false);
    React.useLayoutEffect(() => setDidMount(true), []);
    const context = useContext(ApiStoreContext);

    const isCollectionOwner = props.collection.author_id === context.user?.id;
    const isFollower = !!context.user?.collections?.find(c => c.id === props.collection.id);

    let button;
    if (didMount && isCollectionOwner && !props.collection.is_primary) {
        button = <DeleteButton onClick={() => props.deleteCollection(props.collection.id)}/>
    } else if (didMount && isFollower && !isCollectionOwner) {
        button = <RemoveButton onClick={async () => await props.unfollowCollection(props.collection.id)}/>
    } else if (didMount && context.user && !isCollectionOwner) {
        button = <Button onClick={async () => await props.followCollection(props.collection.id)}>
            <FontAwesomeIcon icon={faPlus}/>
        </Button>
    }

    return (
        <div className={styles.collectionCard}>
            <h3>{props.collection.name}</h3>
            {button}
            <Link href={"/collections/[collection._id]"} as={`/collections/${props.collection.id}`}>
                <a>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width={250} height={200}>
                        <path fill="#164e57"
                              d="M18 40h289v183.8c0 4.2-1.3 6.8-5.7 7.2h-283.1c-6.7 .7-8.4-2.8-8.2-7.9v-174.6c-0.8-6.2 1.9-9 8-8.5Z"/>
                        <path fill="#2da2b5"
                              d="M208 11h93c4.4-0.7 6 2 6 4v25h-115c3-2.5 6.2-3.7 8-9c1.4-3.9 2.2-10.1 3-16c0-1.6 2.7-4.2 5-4Z"/>
                        {props.collection.recipes.map((recipe, i) => {
                            let width, height, x, y;
                            if (props.collection.recipes.length === 1) {
                                width = 287;
                                height = 180;
                                y = 45;
                                x = 15;
                            } else if (props.collection.recipes.length === 2) {
                                width = 140;
                                height = 180;
                                x = 15 + (145 * i);
                                y = 45;
                            } else if (props.collection.recipes.length === 3) {
                                width = i === 0 ? 287 : 140;
                                height = 87.5;
                                x = i < 2 ? 15 : 15 + 145;
                                y = i === 0 ? 45 : 45 + 92.5;
                            } else if (props.collection.recipes.length >= 4) {
                                width = 140;
                                height = 87.5;
                                x = i === 0 || i === 2 ? 15 : 15 + 145;
                                y = i < 2 ? 45 : 45 + 90;
                            }
                            return <image key={i} preserveAspectRatio="xMidYMid slice" href={recipe.image} width={width}
                                          height={height} x={x} y={y}/>
                        })}
                    </svg>
                </a>
            </Link>
            <UserImageSmall id={props.collection.author_id} profileImage={props.collection.author_image}/>
        </div>
    )
});

CollectionCard.propTypes = {
    collection: PropTypes.object.isRequired,
    deleteCollection: PropTypes.func.isRequired,
    unfollowCollection: PropTypes.func.isRequired,
    followCollection: PropTypes.func.isRequired,
};

export default CollectionCard;
