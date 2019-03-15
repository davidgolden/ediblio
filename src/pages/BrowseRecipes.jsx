import React from 'react';
import {inject, observer} from 'mobx-react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/BrowseRecipes.scss';

@inject('apiStore')
@observer
export default class BrowseRecipes extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.apiStore.getRecipes();
    }

    render() {
        const browseRecipesContainerClassName = classNames({
            [styles.browseRecipesContainer]: true,
        });

        return (
            <div className={browseRecipesContainerClassName}>
                {this.props.apiStore.recipes.map(recipe => {
                    return <RecipeCard key={recipe._id} recipe={recipe}/>
                })}
            </div>
        )
    }
};
