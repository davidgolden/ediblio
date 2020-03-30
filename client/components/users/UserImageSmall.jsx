import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import styles from "./styles/UserImageSmall.module.scss";

export default function UserImageSmall(props) {
    const userImageClassName = classNames({
        [styles.container]: true,
        [props.className]: props.className,
    });

    return <div className={userImageClassName}>
        {props.profileImage ?
            <img src={props.profileImage} alt={"User Profile Picture"} style={{height: props.size + "px", width: props.size + "px"}}/> :
            <FontAwesomeIcon icon={faUser} style={{height: props.size*.6 + "px", width: props.size*.6 + "px", padding: props.size*.2 + "px"}} />}
    </div>
}

UserImageSmall.propTypes = {
    size: PropTypes.number.isRequired,
    profileImage: PropTypes.string.isRequired,
};
