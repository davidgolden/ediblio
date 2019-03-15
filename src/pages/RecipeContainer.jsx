import React from 'react';
import RecipeForm from './AddRecipe';
import ShowRecipe from '../components/recipes/ShowRecipe';
import {inject, observer} from 'mobx-react';

@inject('apiStore')
@observer
export default class RecipeContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
        };

        // this.sortByTag = (tag) => {
        //     // event.preventDefault();
        //     let allRecipes = Array.from(document.getElementsByName('tags'));
        //     let unmatchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === false);
        //     let matchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === true);
        //
        //     if (tag === 'all') {
        //         allRecipes.forEach(recipe => {
        //             recipe.parentElement.style.display = 'inline-block';
        //
        //             setTimeout(function () {
        //                 recipe.parentElement.style.opacity = '1';
        //             }, 500);
        //         });
        //
        //     } else {
        //         unmatchedRecipes.forEach(recipe => {
        //             recipe.parentElement.style.opacity = '0';
        //             setTimeout(function () {
        //                 recipe.parentElement.style.display = 'none';
        //             }, 500);
        //         });
        //
        //         matchedRecipes.forEach(recipe => {
        //             recipe.parentElement.style.display = 'inline-block';
        //
        //             setTimeout(function () {
        //                 recipe.parentElement.style.opacity = '1';
        //             }, 500);
        //         });
        //     }
        //     ;
        // }
    }

    // sortByUser = (user) => {
    //     // event.preventDefault();
    //     this.setState({show: false}, function () {
    //         let allRecipes = Array.from(document.getElementsByName('author'));
    //         let unmatchedRecipes = allRecipes.filter(recipe => recipe.value.includes(user) === false);
    //         let matchedRecipes = allRecipes.filter(recipe => recipe.value.includes(user) === true);
    //
    //         unmatchedRecipes.forEach(recipe => {
    //             recipe.parentElement.style.opacity = '0';
    //             setTimeout(function () {
    //                 recipe.parentElement.style.display = 'none';
    //             }, 500);
    //         });
    //
    //         matchedRecipes.forEach(recipe => {
    //             recipe.parentElement.style.display = 'inline-block';
    //
    //             setTimeout(function () {
    //                 recipe.parentElement.style.opacity = '1';
    //             }, 500);
    //         });
    //     })
    // }

    componentDidMount() {
        this.props.apiStore.getRecipe(this.props.recipe_id)
            .then(recipe => {
                this.setState({
                    recipe: recipe,
                })
            });
    }

    toggleEdit = () => {
        this.setState(prevState => {
            return {
                edit: !prevState.edit
            }
        });
    };

    deleteRecipe = () => {
        if (confirm('Are you sure you want to do that?')) {
            this.props.apiStore.deleteRecipe(this.props.recipe_id);
        }
    };

    render() {
        return (
            <div>
                <div className='show-recipe-state'>
                    {/*<button className='btn-success btn btn-md back' onClick={() => this.showRecipe(false)}><i*/}
                    {/*className="fas fa-arrow-left"></i> Back to Recipes*/}
                    {/*</button>*/}
                    {this.state.recipe && this.props.apiStore.isLoggedIn && this.state.recipe.author.id === this.props.apiStore.user._id && (
                        <div className='form-group edit'>
                            {this.state.edit === false ? (
                                <button className='btn btn-primary btn-md' onClick={() => this.toggleEdit()}><i
                                    className="fas fa-edit"/> Edit</button>
                            ) : (
                                <button className='btn btn-primary btn-md' onClick={() => this.toggleEdit()}><i
                                    className="fas fa-search"/> View</button>
                            )}
                            <button className='btn btn-primary btn-md' onClick={this.deleteRecipe}><i
                                className="fas fa-trash-alt"/> Delete Recipe
                            </button>
                        </div>
                    )}
                    {this.state.edit === true ? (
                        <div className='show-recipe-style'>
                            <RecipeForm
                                user={this.props.user}
                                tags={this.props.tags}
                                recipe={this.state.recipe}
                                toggleEdit={this.toggleEdit}
                            />
                        </div>
                    ) : (
                        <ShowRecipe
                            recipe={this.state.recipe}
                            user={this.props.user}
                            showRecipe={this.showRecipe}
                            sortByUser={this.sortByUser}
                        />
                    )}
                </div>
            </div>
        )
    }
}
