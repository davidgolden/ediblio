import React, {useState, useEffect} from 'react';
import {recipeTags} from "../../stores/Setings";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import styles from './styles/TagFilterBar.scss';
import classNames from 'classnames';
import Button from "../utilities/buttons/Button";
import useDebounce from "../utilities/useDebounce";

const TagFilterBar = props => {

    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (typeof debouncedSearchTerm === 'string') {
            props.setSearchTerm(searchTerm);
        }
    }, [debouncedSearchTerm]);

    const tagsContainerClassName = classNames({
        [styles.tagsContainer]: true,
    });
    const searchContainerClassName = classNames({
        [styles.searchContainer]: true,
    });

    return (
        <div className={tagsContainerClassName}>
            <div>
                {recipeTags.map(tag => {
                    const tagClassName = classNames({
                        [styles.tag]: true,
                        [styles.tagSelected]: props.selectedTags.includes(tag),
                    });

                    return <Button className={tagClassName} onClick={() => props.sortByTag(tag)}
                                   key={tag}>{tag}</Button>
                })}
            </div>
            <div className={searchContainerClassName}>
                <FontAwesomeIcon icon={faSearch}/>
                <input placeholder={'Filter By Name or Ingredient'} value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}/>
            </div>
        </div>
    )
};

export default TagFilterBar;
