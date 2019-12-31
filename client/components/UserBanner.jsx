import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles/UserBanner.scss';
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function UserBanner(props) {
    return <div className={styles.userBanner}>
        <div >
            {props.images.map((image, i) => {
                return <div key={i} style={{backgroundImage: `url(${image})`}}/>
            })}
        </div>
        <div>
            {props.user.profileImage ? <img src={props.user.profileImage}/> : <FontAwesomeIcon icon={faUser} />}
            <h2>{props.user.username}</h2>
        </div>
    </div>
}

UserBanner.propTypes = {
    images: PropTypes.array.isRequired,
}
