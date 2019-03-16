import React from 'react';
import {inject, observer} from 'mobx-react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';
import TagFilterBar from "../components/recipes/TagFilterBar";

@inject('apiStore')
@observer
export default class BrowseRecipes extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.apiStore.getRecipes();
    }

    sortByTag = tag => {
        this.props.apiStore.getRecipes({
            tag: tag,
        })
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
                </div>
            </div>
        )
    }
};
