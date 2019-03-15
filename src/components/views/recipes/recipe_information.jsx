import React from 'react';
import axios from 'axios';

const ImageLoader = (props) => {
    if (props.loadState === 'empty') {
        return null;
    }
    else if (props.loadState === 'loading') {
        return (
            <div>
                <small>Loading Image...</small>
                <br/>
                <span className="sr-only">Loading...</span>
            </div>
        )
    }
    else if (props.loadState === 'found') {
        return (
            <img src={props.image} id='recipeImage'/>
        )
    }
    else if (props.loadState === 'noimage') {
        return (
            <div>
                <small id='imageText'>No image found. Please enter image URL:</small>
                <input value={props.image} onChange={(e) => props.handleRecipeImageChange(e.target.value)} name='image'
                       className='form-control'/>
            </div>
        )
    }
}

export default class RecipeInformation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loadState: 'empty'
        };
    }

    scrapeImage = link => {
        this.setState({loadState: 'loading'});

        axios.post('/api/scrape', {
            imageUrl: link,
        })
            .then(response => {
                this.setState({
                    loadState: 'found',
                });
                this.props.handleRecipeImageChange(response.data.imageUrl);
            })
            .catch(() => {
                this.setState({
                    loadState: 'noimage',
                })
            });
    };

    handleRecipeLinkChange = e => {
        this.props.handleRecipeLinkChange(e);
        if (e.target.value === '') {
            return this.setState({loadState: 'empty'})
        } else {
            window.setTimeout(this.scrapeImage(e.target.value), 2000);
            // this.scrapeImage(link)
        }
    };

    render() {
        return (
            <div>
                <h3>Recipe Information</h3>
                <label htmlFor='name'>Recipe Name</label>
                <input type='text' required name='name' value={this.props.name} className='form-control'
                       onChange={this.props.handleRecipeNameChange}/>
                <label htmlFor='link'>Recipe URL</label>
                <input type='text' name='link' value={this.props.url} className='form-control'
                       onChange={this.handleRecipeLinkChange}/>
                <ImageLoader
                    loadState={this.state.loadState}
                    image={this.props.image}
                    handleRecipeImageChange={this.props.handleRecipeImageChange}
                />
                <label htmlFor='notes'>Notes</label>
                <textarea name='notes' className='form-control' value={this.props.notes}
                          onChange={this.props.handleRecipeNotesChange}/>
            </div>
        )
    }
}
