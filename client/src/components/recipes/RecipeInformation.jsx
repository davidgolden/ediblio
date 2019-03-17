import React from 'react';
import axios from 'axios';
import styles from './styles/RecipeInformation.scss';
import classNames from 'classnames';

const ImageLoader = (props) => {
    if (!props.loading && !props.foundImage && !props.uploadedImage) {
        return null;
    } else if (props.loading) {
        return (
            <div>
                <small>Loading Image...</small>
                <br/>
                <span className="sr-only">Loading...</span>
            </div>
        )
    } else if (props.foundImage || props.uploadedImage) {
        return (
            <img src={props.image} id='recipeImage'/>
        )
    }
};

export default class RecipeInformation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            foundImage: false,
            loading: false,
            uploadedImage: false,
        };
    }

    scrapeImage = link => {
        this.setState({loading: true});

        axios.post('/api/scrape', {
            imageUrl: link,
        })
            .then(response => {
                this.setState({
                    loading: false,
                    foundImage: true,
                });
                this.props.handleRecipeImageChange(response.data.imageUrl);
            })
            .catch(() => {
                this.setState({
                    loading: false,
                })
            });
    };

    handleRecipeLinkChange = e => {
        this.props.handleRecipeLinkChange(e);
        if (e.target.value && !this.state.uploadedImage) {
            window.setTimeout(this.scrapeImage(e.target.value), 2000);
        }
    };

    handleFileUpload = file => {
        function processFile(dataURI, max_height, max_width, type = "image/jpeg") {
            return new Promise(res => {
                const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
                    atob(dataURI.split(',')[1]) :
                    decodeURI(dataURI.split(',')[1]);
                const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
                const max = bytes.length;
                const ia = new Uint8Array(max);
                for (let i = 0; i < max; i++) {
                    ia[i] = bytes.charCodeAt(i);
                }
                const blob = new Blob([ia], {type: mime});

                window.URL = window.URL || window.webkitURL;
                const blobURL = window.URL.createObjectURL(blob); // and get its URL

                const image = new Image(); // helper Image object
                image.src = blobURL;
                image.onload = () => { // have to wait till it's loaded
                    res(resize(image, max_height, max_width, type)); // send it to canvas
                }
            })
        }

        function resize(img, max_height, max_width, type) {
            const canvas = document.createElement('canvas');

            let width = img.width;
            let height = img.height;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > max_width) {
                    height = Math.round(height *= max_width / width);
                    width = max_width;
                }
            } else {
                if (height > max_height) {
                    width = Math.round(width *= max_height / height);
                    height = max_height;
                }
            }

            // resize the canvas and draw the image data into it
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            return canvas.toDataURL(type, 0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)
        }

        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onloadend = readerEvent => {
            const dataURI = readerEvent.target.result;
            if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                alert('Your image size is too big and our image compression tools are not supported on your browser. Please use a smaller image!');
                return false;
            }
            processFile(dataURI, 300, 300, file.type)
                .then(uri => {
                    this.setState({
                        foundImage: true,
                        uploadedImage: true,
                    });
                    this.props.handleRecipeImageChange(uri);
                });
        };
    };

    render() {
        const recipeInformationClassName = classNames({
            [styles.recipeInformation]: true,
        });

        return (
            <div className={recipeInformationClassName}>
                <h3>Recipe Information</h3>
                <label htmlFor='name'>Recipe Name</label>
                <input type='text' name='name' value={this.props.name}
                       onChange={this.props.handleRecipeNameChange}/>
                <label htmlFor='link'>Recipe URL</label>
                <input type='text' name='link' value={this.props.url}
                       onChange={this.handleRecipeLinkChange}/>
                <ImageLoader
                    loading={this.state.loading}
                    foundImage={this.state.foundImage}
                    uploadedImage={this.state.uploadedImage}
                    image={this.props.image}
                />
                <label htmlFor={'file'}>Recipe Image</label>
                <input type={'file'} name={'file'}
                       onChange={e => this.handleFileUpload(e.target.files[0])}
                       accept={'image/*'}
                />
                <label htmlFor='notes'>Notes</label>
                <textarea name='notes' value={this.props.notes}
                          onChange={this.props.handleRecipeNotesChange}/>
            </div>
        )
    }
}
