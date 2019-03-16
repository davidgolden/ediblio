import React from 'react';
import {Link} from '@reach/router';
import {inject, observer} from 'mobx-react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/UserRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";

@inject('apiStore')
@observer
export default class UserRecipes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        this.props.apiStore.getRecipes({
            author: this.props.user_id,
        })
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
                        </div>
                    </div>
                )
                }
            </div>
        )
    };
}

