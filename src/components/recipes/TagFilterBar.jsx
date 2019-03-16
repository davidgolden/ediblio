import React from 'react';
import {recipeTags} from "../../stores/Setings";
import styles from './styles/TagFilterBar.scss';
import classNames from 'classnames';
import Button from "../utilities/buttons/Button";

const TagFilterBar = props => {
    const tagsContainerClassName = classNames({
        [styles.tagsContainer]: true,
    });

    return (
        <div className={tagsContainerClassName}>
            <Button onClick={() => props.sortByTag('all')}>All</Button>
            {recipeTags.map(tag => {
                return <Button onClick={() => props.sortByTag(tag)}
                               key={tag}>{tag}</Button>
            })}
        </div>
    )
};

export default TagFilterBar;
