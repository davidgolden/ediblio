import React from 'react';
import {Link} from "@reach/router";
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './styles/RecipeCard.scss';
import RemoveButton from "./utilities/buttons/RemoveButton";
import InCloudButton from "./utilities/buttons/InCloudButton";
import AddButton from "./utilities/buttons/AddButton";

@inject('apiStore')
@observer
export default class RecipeCard extends React.Component {
    static propTypes = {
        recipe: PropTypes.object,
    };

    removeFromCloud = () => {
        let currentCloud = this.props.apiStore.user.recipes;
        currentCloud = currentCloud.filter(recipe => recipe.id !== this.props.recipe.id);
        this.props.apiStore.patchUser({
            recipes: currentCloud,
        })
    };

    addToCloud = () => {
        let currentCloud = this.props.apiStore.user.recipes;
        currentCloud.push(this.props.recipe);
        this.props.apiStore.patchUser({
            recipes: currentCloud,
        })
    };

    render() {
        const { recipe, apiStore } = this.props;

        const recipeCardClassName = classNames({
            [styles.recipeCard]: true,
        });
        const recipeCardImageClassName = classNames({
            [styles.recipeCardImage]: true,
        });
        const recipeCardTextClassName = classNames({
            [styles.recipeCardText]: true,
        });
        const authorTextClassName = classNames({
            [styles.authorText]: true,
        });
        const recipeCardButtonClassName = classNames({
            [styles.recipeCardButtons]: true,
        });

        let buttons = [];
        if (apiStore.isLoggedIn) {
            const inCloud = apiStore.user.recipes.includes(recipe._id)
            if (apiStore.user._id === recipe.author.id) {
                buttons.push(<InCloudButton/>)
            }
            if (inCloud && apiStore.user._id !== recipe.author.id) {
                buttons.push(<RemoveButton onClick={(e) => this.removeFromCloud(e.currentTarget, recipe)}/>)
            }
            if (!inCloud) {
                buttons.push(<AddButton onClick={(e) => this.addToCloud(e.currentTarget, recipe)}/>)
            }
        }

        return (
            <div key={recipe._id} className={recipeCardClassName}>
                <input type='hidden' name='tags' value={recipe.tags} />
                <input type='hidden' name='author' value={recipe.author.id} />
                <Link to={`/recipes/${recipe._id}`}>
                    <div>
                        <img src={recipe.image} className={recipeCardImageClassName}/>
                    </div>
                    <div className={recipeCardTextClassName}>
                        <h3>{recipe.name}</h3>
                        <p>{recipe.notes}</p>
                    </div>
                </Link>
                <button className={authorTextClassName} onClick={() => this.props.sortByUser(recipe.author.id)}><h6>Submitted by {recipe.author.username}</h6></button>
                <div className={recipeCardButtonClassName}>
                    {buttons.map(item => item)}
                </div>
            </div>
        )
    }
}
