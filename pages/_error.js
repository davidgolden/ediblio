import React from 'react';

export default function ErrorPage(props) {
    console.log(error);
    return <div>
        Whoops.. looks like we made a mistake!
        <p>{props.error}</p>
    </div>
}
