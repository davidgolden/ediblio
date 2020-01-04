import React, {useContext, useState, useEffect} from 'react';
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
    const [isClient, setIsClient] = useState(false);
    const context = useContext(ApiStoreContext);

    const isCollectionOwner = props.collection.ownerId._id === context.user?._id;
    const isFollower = !!context.user?.collections.find(c => c._id === props.collection._id);

    useEffect(() => {
        // this is a really shitty way to deal with this, but it's a workaround until hopefully svg bug is fixed in React
        // since context.user is never defined on the server, we can trust this to render correctly for now...
        setIsClient(typeof window !== 'undefined');
    }, [typeof window]);

    let button;
    if (isClient && isCollectionOwner) {
        button = <DeleteButton onClick={() => props.deleteCollection(props.collection._id)}/>
    } else if (isClient && isFollower) {
        button = <RemoveButton onClick={() => props.removeCollection(props.collection._id)}/>
    } else if (isClient && context.user) {
        button = <Button onClick={() => props.addCollection(props.collection._id)}>
            <FontAwesomeIcon icon={faPlus}/>
        </Button>
    }

    return (
        <div className={styles.collectionCard}>
            <h3>{props.collection.name}</h3>
            {button}
            <Link href={`/collections/${props.collection._id}`}>
                <a>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width={250} height={200}>
                        <path fill="#164e57"
                              d="M18 40h289v183.8c0 4.2-1.3 6.8-5.7 7.2h-283.1c-6.7 .7-8.4-2.8-8.2-7.9v-174.6c-0.8-6.2 1.9-9 8-8.5Z"/>
                        <path fill="#2da2b5"
                              d="M208 11h93c4.4-0.7 6 2 6 4v25h-115c3-2.5 6.2-3.7 8-9c1.4-3.9 2.2-10.1 3-16c0-1.6 2.7-4.2 5-4Z"/>
                        {props.collection.recipes.map((image, i) => {
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
                            } else if (props.collection.recipes.length === 4) {
                                width = 140;
                                height = 87.5;
                                x = i === 0 || i === 2 ? 15 : 15 + 145;
                                y = i < 2 ? 45 : 45 + 90;
                            }
                            return <image key={i} preserveAspectRatio="xMidYMid slice" href={image} width={width}
                                          height={height} x={x} y={y}/>
                        })}
                    </svg>
                </a>
            </Link>
            <UserImageSmall id={props.collection.ownerId._id} profileImage={props.collection.ownerId.profileImage}/>
        </div>
    )
});

CollectionCard.propTypes = {
    collection: PropTypes.object.isRequired,
    deleteCollection: PropTypes.func.isRequired,
    removeCollection: PropTypes.func.isRequired,
    addCollection: PropTypes.func.isRequired,
};

export default CollectionCard;
