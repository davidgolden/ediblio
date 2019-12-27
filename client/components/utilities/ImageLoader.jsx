import React from "react";

const ImageLoader = props => {
    if (!props.loading && !props.foundImage && !props.uploadedImage) {
        return null;
    } else if (props.loading) {
        return (
            <div>
                <small>Loading Image...</small>
            </div>
        )
    } else if (props.foundImage || props.uploadedImage) {
        return (
            <img src={props.image} id='recipeImage'/>
        )
    }
};

export default ImageLoader;
