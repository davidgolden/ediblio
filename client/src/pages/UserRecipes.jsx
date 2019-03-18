import React from 'react';
import {Link} from '@reach/router';
import {inject, observer} from 'mobx-react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/UserRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";
import {autorun} from "mobx";

@inject('apiStore')
@observer
export default class UserRecipes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            lastRecipePageLoaded: 0,
        }
    }

    componentDidMount() {
        this.props.apiStore.getRecipes({
            author: this.props.user_id,
        });

        this.disabler = autorun(() => {
            if (this.props.apiStore.distanceToBottom === 0) {
                this.setState(prevState => {
                    this.props.apiStore.getRecipes({
                        page: prevState.lastRecipePageLoaded + 1,
                        author: this.props.user_id,
                    });
                    return {
                        lastRecipePageLoaded: prevState.lastRecipePageLoaded + 1,
                    }
                })
            }
        })
    }

    componentWillUnmount() {
        this.disabler();
    }

    sortByTag = tag => {
        this.props.apiStore.getRecipes({
            tag: tag,
            author: this.props.user_id,
        })
    };

    render() {
        const recipeCardsContainerClassName = classNames({
            [styles.recipeCardsContainer]: true,
        });

        return (
            <div>
                {(this.state.loading === false) ? (
                    <div className='text-center'>
                        <h2>There doesn't seem to be anything here...</h2><br/>
                        <h2>Get started by </h2>
                        <Link to={'/browse'} className='btn btn-md btn-success'>browsing existing
                            recipes</Link>
                        <h2> or </h2>
                        <Link className='btn btn-success btn-md' to={'/add'}>adding a recipe.</Link>
                    </div>
                ) : (
                    <div>
                        <TagFilterBar sortByTag={this.sortByTag}/>
                        <div className={recipeCardsContainerClassName}>
                            {this.props.apiStore.recipes.map(recipe => {
                                return <RecipeCard key={recipe._id} recipe={recipe}/>
                            })}
                            {this.props.apiStore.recipes.length === 0 && <p>There doesn't seem to be anything here...</p>}
                        </div>
                    </div>
                )
                }
            </div>
        )
    };
}

