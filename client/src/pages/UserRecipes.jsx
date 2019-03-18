import React from 'react';
import {Link} from '@reach/router';
import {inject, observer} from 'mobx-react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/UserRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";
import {autorun} from "mobx";
import LoadingNextPage from "../components/utilities/LoadingNextPage";

@inject('apiStore')
@observer
export default class UserRecipes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lastRecipePageLoaded: 0,
            loadedAll: false,
        }
    }

    componentDidMount() {
        this.props.apiStore.getRecipes({
            author: this.props.user_id,
        });

        this.disabler = autorun(() => {
            if (this.props.apiStore.distanceToBottom === 0 && !this.state.loadedAll) {
                this.props.apiStore.getRecipes({
                    page: this.state.lastRecipePageLoaded + 1,
                    author: this.props.user_id,
                })
                    .then(recipes => {
                        this.setState(prevState => {
                            if (recipes.length === 0) {
                                return {
                                    loadedAll: true,
                                }
                            } else {
                                return {
                                    lastRecipePageLoaded: prevState.lastRecipePageLoaded + 1,
                                }
                            }
                        })
                    });
            }
        })
    }

    componentWillUnmount() {
        this.disabler();
    }

    sortByTag = tag => {
        if (tag === 'all') {
            this.props.apiStore.getRecipes({
                author: this.props.user_id,
            })
        } else {
            this.props.apiStore.getRecipes({
                tag: tag,
                author: this.props.user_id,
            })
        }
    };

    render() {
        const recipeCardsContainerClassName = classNames({
            [styles.recipeCardsContainer]: true,
        });

        return (
            <div>
                <TagFilterBar sortByTag={this.sortByTag}/>
                <div className={recipeCardsContainerClassName}>
                    {this.props.apiStore.recipes.map(recipe => {
                        return <RecipeCard key={recipe._id} recipe={recipe}/>
                    })}
                    {this.props.apiStore.recipes.length === 0 && <p>There doesn't seem to be anything here...</p>}
                </div>
                {this.state.loadedAll || <LoadingNextPage/>}
            </div>
        )
    };
}

