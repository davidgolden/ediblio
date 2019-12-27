import React from 'react';
import PropTypes from 'prop-types';

const JsonLd = ({data}) => {
    const verified_data = {};

    for (let key in data) {
        if (data.hasOwnProperty(key)
            && typeof data[key] !== 'undefined'
            && !(typeof data[key] === 'string' && data[key].length === 0)
        ) {
            verified_data[key] = data[key];
        }
    }

    return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(verified_data)}} />;
};

JsonLd.propTypes = {
    data: PropTypes.object.isRequired,
};

export default JsonLd;
