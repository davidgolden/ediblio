import React from 'react';
import {Link} from "@reach/router";
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './styles/RecipeCard.scss';

@inject('apiStore')
@observer
export default class RecipeCard extends React.Component {
    static propTypes = {
        recipe: PropTypes.object,
    };

    removeFromCloud = () => {

    };

    addToCloud = () => {

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
                    { apiStore.isLoggedIn && apiStore.user.recipes.includes(recipe._id) ? (
                        apiStore.user._id === recipe.author.id ? <button className='btn btn-sm btn-success disabled'><i className="fas fa-book" /></button> : (
                            <div>
                                <button className='btn btn-sm btn-success disabled'><i className="fas fa-book" /></button>
                                <button className='btn btn-sm btn-danger' onClick={(e) => this.removeFromCloud(e.currentTarget, recipe)}><i className="fas fa-minus" /></button>
                            </div>
                        )
                    ) : (
                        <button className='btn btn-sm btn-warning' onClick={(e) => this.addToCloud(e.currentTarget, recipe)}><i className="fas fa-plus" /></button>
                    )}
                </div>
            </div>
        )
    }
}
