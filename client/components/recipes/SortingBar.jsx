import React, {useState, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import styles from './styles/SortingBar.scss';
import classNames from 'classnames';
import useDebounce from "../utilities/useDebounce";

const tagsContainerClassName = classNames({
    [styles.tagsContainer]: true,
});
const searchContainerClassName = classNames({
    [styles.searchContainer]: true,
});

const SortingBar = props => {

    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (typeof debouncedSearchTerm === 'string') {
            props.setSearchTerm(searchTerm);
        }
    }, [debouncedSearchTerm]);

    return (
        <div className={tagsContainerClassName}>
            <div className={searchContainerClassName}>
                <FontAwesomeIcon icon={faSearch}/>
                <input placeholder={'Filter By Name or Ingredient'} value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}/>
            </div>
        </div>
    )
};

export default SortingBar;
