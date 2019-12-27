import React, { useState, useContext } from 'react';
import RecipeInformation from '../client/components/recipes/RecipeInformation';
import AddIngredients from '../client/components/recipes/AddIngredients';
import Button from "../client/components/utilities/buttons/Button";
import {recipeTags} from "../client/stores/Setings";
import styles from './styles/AddRecipe.scss';
import classNames from 'classnames';
import {ApiStoreContext} from "../client/stores/api_store";
import {observer} from "mobx-react";
import Router from 'next/router';
import axios from 'axios';

const AddTags = (props) => {
    const tagClassName = classNames({
        [styles.tag]: true,
    });

    const TagList = recipeTags.map((tag, i) => {
        return (
            <div className={tagClassName} key={i}>
                <label>
                    <input
                        checked={props.selectedTags.includes(tag)}
                        type="checkbox"
                        name="recipe[tags]"
                        value={tag}
                        onChange={(e) => props.toggleTag(tag)}
                    />
                    {tag}
                </label>
            </div>
        )
    });

    return (
        <div>
            <h3>Add Tags</h3>
            {TagList}
        </div>
    )
};

const RecipeForm = observer(props => {
    const [name, setName] = useState(props.editMode ? props.recipe.name : '');
    const [url, setUrl] = useState(props.editMode ? props.recipe.url : '');
    const [image, setImage] = useState(props.editMode ? props.recipe.image : '');
    const [rawImage, setRawImage] = useState('');
    const [notes, setNotes] = useState(props.editMode ? props.recipe.notes : '');
    const [ingredients, setIngredients] = useState(props.editMode ? props.recipe.ingredients : []);
    const [tags, setTags] = useState(props.editMode ? props.recipe.tags : []);
    const [updated, setUpdated] = useState(new Set());
    const [submitted, setSubmitted] = useState(false);

    const context = useContext(ApiStoreContext);

    function addToUpdated(update) {
        setUpdated(u => {
            const newUpdate = u;
            newUpdate.add(update);
            return newUpdate;
        })
    }

    const toggleTag = tag => {
        addToUpdated('tags');
        if (tags.includes(tag)) {
            // remove it
            let i = tags.indexOf(tag);
            let newTags = tags;
            newTags.splice(i, 1);
            setTags([...newTags]);
        } else {
            // add it
            let newTags = tags;
            newTags.push(tag);
            setTags([...newTags]);
        }
    };

    function handleUpdateAllIngredients(ingredients) {
        addToUpdated('ingredients');
        setIngredients(ingredients);
    }

    function handleRecipeImageChange(data, raw = false) {
        addToUpdated('image');
        if (!raw) {
            setImage(data);
        } else {
            const blobURL = window.URL.createObjectURL(data);
            setImage(blobURL);
            setRawImage(data);
        }
    }

    function handleUrlChange(e) {
        addToUpdated('url');
        setUrl(e.target.value);
    }

    function handleNameChange(e) {
        addToUpdated('name');
        setName(e.target.value);
    }

    function handleNotesChange(e) {
        addToUpdated('notes');
        setNotes(e.target.value);
    }

    const handleSubmit = async () => {
        setSubmitted(true);
        const uploadObject = {};
        if (updated.has('name')) {
            uploadObject.name = name;
        }
        if (updated.has('url')) {
            uploadObject.url = url;
        }
        if (updated.has('image')) {
            const fd = new FormData();
            fd.append('file', rawImage ? rawImage : image);
            fd.append('upload_preset', 'l9apptfs');
            fd.append('resource_type', 'image');
            const response = await axios.post(`https://api.cloudinary.com/v1_1/recipecloud/upload`, fd);
            uploadObject.image = response.data.secure_url;
        }
        if (updated.has('notes')) {
            uploadObject.notes = notes;
        }
        if (updated.has('ingredients')) {
            uploadObject.ingredients = ingredients;
        }
        if (updated.has('tags')) {
            uploadObject.tags = tags;
        }
        if (props.editMode) {
            context.patchRecipe(props.recipe._id, uploadObject)
                .then(recipe => {
                    props.updateRecipe(recipe);
                    props.toggleEdit();
                })
        } else {
            context.createRecipe(uploadObject)
                .then(() => {
                    Router.push("/");
                })
        }
    };

    const recipeFormClassName = classNames({
        [styles.recipeForm]: true,
    });
    const submitButtonClassName = classNames({
        [styles.submitButton]: true,
        [styles.submitButtonDisabled]: !(name && image) || submitted,
    });

    return (
        <div className={recipeFormClassName}>
            <h2>Submit a Recipe</h2>
            <RecipeInformation
                name={name}
                url={url}
                image={image}
                notes={notes}
                handleRecipeLinkChange={handleUrlChange}
                handleRecipeNameChange={handleNameChange}
                handleRecipeImageChange={handleRecipeImageChange}
                handleRecipeNotesChange={handleNotesChange}
            />
            <AddIngredients
                ingredients={ingredients}
                handleUpdateAllIngredients={handleUpdateAllIngredients}
            />
            <AddTags toggleTag={toggleTag} selectedTags={tags}/>
            <div>
                {context.user ?
                    <Button className={submitButtonClassName} onClick={handleSubmit}>{props.editMode ? "Save" : "Submit!"}</Button> :
                    <p>You must be logged in to add a recipe!</p>}
            </div>
        </div>
    )
});

RecipeForm.defaultProps = {
    editMode: false,
};

export default RecipeForm;
