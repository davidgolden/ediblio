import React from 'react';
import {inject, observer} from 'mobx-react';
import { autorun } from 'mobx';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";

@inject('apiStore')
@observer
export default class BrowseRecipes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lastRecipePageLoaded: 0,
        }
    }

    componentDidMount() {
        this.props.apiStore.getRecipes();

        this.disabler = autorun(() => {
            if (this.props.apiStore.distanceToBottom === 0) {
                this.setState(prevState => {
                    this.props.apiStore.getRecipes({
                        page: prevState.lastRecipePageLoaded + 1,
                    });
                    console.log(prevState.lastRecipePageLoaded);
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
        if (tag === 'all') {
            this.props.apiStore.getRecipes({
                tag: tag,
            })
        } else {
            this.props.apiStore.getRecipes()
        }
    };

    render() {
        const browseRecipesContainerClassName = classNames({
            [styles.browseRecipesContainer]: true,
        });

        return (
            <div>
                <TagFilterBar sortByTag={this.sortByTag}/>
                <div className={browseRecipesContainerClassName}>
                    {this.props.apiStore.recipes.map(recipe => {
                        return <RecipeCard key={recipe._id} recipe={recipe}/>
                    })}
                    {this.props.apiStore.recipes.length === 0 && <p>There doesn't seem to be anything here...</p>}
                </div>
            </div>
        )
    }
};
