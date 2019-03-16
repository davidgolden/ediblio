import React from 'react';
import {recipeTags} from "../../stores/Setings";

const TagFilterBar = props => {
    const TagButtonList = recipeTags.map((tag) => {
        return <button onClick={() => props.sortByTag(tag)} className='tag btn btn-md btn-success'
                       key={tag}>{tag}</button>
    });
    return (
        <div className='text-center'>
            <button onClick={() => props.sortByTag('all')} className='tag btn btn-md btn-success'>All</button>
            {TagButtonList}
        </div>
    )
};

export default TagFilterBar;
