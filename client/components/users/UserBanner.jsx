import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles/UserBanner.module.scss';
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import UserImageSmall from "./UserImageSmall";
import {getCdnImageUrl} from "../../utils/images";

export default function UserBanner(props) {
    return <div className={styles.userBanner}>
        <div>
            {props.images.map((image, i) => {
                return <div key={i} style={{backgroundImage: `url(${getCdnImageUrl(image)})`}}/>
            })}
        </div>

        <div>
            <UserImageSmall size={200} profileImage={getCdnImageUrl(props.user.profile_image)}/>
            {/*{props.user.profile_image ? <img src={props.user.profile_image}/> : <FontAwesomeIcon icon={faUser} />}*/}
            <h2>{props.user.username}</h2>
        </div>
    </div>
}

UserBanner.propTypes = {
    images: PropTypes.array.isRequired,
}
