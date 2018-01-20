import React from 'react';

const ImageLoader = (props) => {
  if(props.loadState === 'empty') {
    return null;
  }
  else if(props.loadState === 'loading') {
    return (
      <div>
        <small>Loading Image...</small><br />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
  else if(props.loadState === 'found') {
    return(
      <img src={props.image} id='recipeImage' />
    )
  }
  else if(props.loadState === 'noimage') {
    return (
      <div>
        <small id='imageText'>No image found. Please enter image URL:</small>
        <input value={props.image} onChange={(e) => props.handleRecipeImageChange(e.target.value)} name='image' className='form-control' />
      </div>
    )
  }
}

class RecipeInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loadState: 'empty'
    }

    this.scrapeImage = (link) => {
      this.setState({loadState: 'loading'});

      let xml = new XMLHttpRequest();
      xml.open("POST", "/scrape", true);
      xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xml.send(JSON.stringify({imageUrl: link}));

      xml.onreadystatechange = () => {
        console.log(xml.response)
        if (xml.readyState === 4 && xml.status === 200) {
            // set image to image URL
            props.handleRecipeImageChange(xml.response);
            this.setState({loadState: 'found'});
            console.log('success')
        }
        else if(xml.status === 404) {
          props.handleRecipeImageChange(xml.response);
          this.setState({loadState: 'noimage'});
          console.log('no image')
        }
      }
    }

    this.handleRecipeLinkChange = (link) => {
      props.handleRecipeLinkChange(link);
      if(link === '') {
        return this.setState({loadState: 'empty'})
      } else {
        let scrapingTimer = window.setTimeout(this.scrapeImage(link), 2000);
      }
    }
  }

  render() {
    return (
      <div>
      <h3>Recipe Information</h3>
      <label htmlFor='name'>Recipe Name</label>
      <input type='text' required name='name' value={this.props.name} className='form-control' onChange={(e) => this.props.handleRecipeNameChange(e.target.value)}></input>
      <label htmlFor='link'>Recipe URL</label>
      <input type='text' name='link' value={this.props.url} className='form-control' onChange={(e) => this.handleRecipeLinkChange(e.target.value)}></input>
      <ImageLoader
        loadState={this.state.loadState}
        image={this.props.image}
        handleRecipeImageChange={this.props.handleRecipeImageChange}
      />
      <label htmlFor='notes'>Notes</label>
      <textarea name='notes' className='form-control' value={this.props.notes} onChange={(e) => this.props.handleRecipeNotesChange(e.target.value)}></textarea>
      </div>
    )
  }
}

export default RecipeInformation;
