import React from 'react';
import PropTypes from 'prop-types';
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import styles from "../styles/RecipeCard.scss";

export default function UserImageSmall(props) {
    const userImageClassName = classNames({
        [styles.userImage]: true,
    });

    return <div className={userImageClassName}>
        <Link href={`/users/${props.id}/recipes`}>
            <a>
                {props.profileImage ?
                    <img src={props.profileImage}/> :
                    <FontAwesomeIcon icon={faUser}/>}
            </a>
        </Link>
    </div>
}

UserImageSmall.propTypes = {
    id: PropTypes.string.isRequired,
    profileImage: PropTypes.string.isRequired,
};
