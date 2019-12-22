import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames';
import styles from './styles/LoadingNextPage.scss';

const LoadingNextPage = props => {
    const loadingContainerClassName = classNames({
        [styles.loadingContainer]: true,
    });

    return <div className={loadingContainerClassName}>
        <div>
            <strong>Loading More Recipes...</strong>
        </div>
        <FontAwesomeIcon icon={faSpinner} spin/>
    </div>
}

export default LoadingNextPage;
