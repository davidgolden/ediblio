import React from 'react';
import AddIngredients from './AddIngredients';
import classNames from 'classnames';
import styles from './styles/ShowRecipe.scss';
import {inject, observer} from 'mobx-react';
import {Link} from '@reach/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import Button from "../utilities/buttons/Button";

@inject('apiStore')
@observer
export default class ShowRecipe extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            added: false,
        }
    }

    handleAddToList = () => {
        this.setState(() => {
            this.props.addToGroceryList();

            return {
                added: true,
            }
        })
    };

    render() {
        const showRecipeContainerClassName = classNames({
            [styles.showRecipeContainer]: true,
        });
        const showRecipeTitleClassName = classNames({
            [styles.showRecipeTitle]: true,
        });
        const showRecipeImageClassName = classNames({
            [styles.showRecipeImage]: true,
        });
        const showRecipeButtonsClassName = classNames({
            [styles.showRecipeButtons]: true,
            [styles.showRecipeButtonsDisabled]: this.state.added,
        });
        const showRecipeIngredientsClassName = classNames({
            [styles.showRecipeIngredients]: true,
        });

        // let addButtons;
        // if (this.props.apiStore.isLoggedIn && this.state.added) {
        //     addButtons
        // }

        return (
            <div className={showRecipeContainerClassName}>
                <div className={showRecipeTitleClassName}>
                    {this.props.recipe && <div>
                        <h1>{this.props.recipe.name}</h1>
                        <h2>Submitted by <Link to={`/users/${this.props.recipe.author.id}/recipes`}>
                            {this.props.recipe.author.username}
                        </Link>. {this.props.recipe.url &&
                        <a href={this.props.recipe.url} target='_blank'>View Original Recipe</a>}</h2>
                        <div>
                            {this.props.recipe.tags.map(tag => {
                                return <span key={tag}>{tag}</span>
                            })}
                        </div>
                    </div>}
                </div>
                <div className={showRecipeImageClassName}>
                    {this.props.recipe && <img src={this.props.recipe.image}/>}
                </div>
                {this.props.recipe && <div className={showRecipeIngredientsClassName}>
                    <h3>Recipe Notes</h3>
                    <p>{this.props.recipe.notes}</p>
                    <AddIngredients
                        ingredients={this.props.recipe.ingredients}
                        handleAddIngredient={this.props.handleAddIngredient}
                        handleUpdateIngredient={this.props.handleUpdateIngredient}
                        handleDeleteIngredient={this.props.handleDeleteIngredient}
                    />
                    <div className={showRecipeButtonsClassName}>
                        {}
                        {this.props.apiStore.isLoggedIn ? <Button onClick={this.handleAddToList}>
                            <FontAwesomeIcon icon={faShoppingBag}/> {this.state.added ? 'Added To' : 'Add To'} Grocery List
                        </Button> : <p>Login or Register to Add to Grocery List</p>}
                    </div>
                </div>}
            </div>
        )
    }
}
