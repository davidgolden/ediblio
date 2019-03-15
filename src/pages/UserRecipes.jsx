import React from 'react';
import {Link} from '@reach/router';
import {inject, observer} from 'mobx-react';
import RecipeCard from "../components/RecipeCard";
import classNames from 'classnames';
import styles from './styles/UserRecipes.scss';

const TagFilter = (props) => {
    const TagButtonList = props.tags.map((tag) => {
        return <button onClick={() => props.sortByTag(tag)} className='tag btn btn-md btn-success'
                       key={tag}>{tag}</button>
    })
    return (
        <div className='text-center'>
            <button onClick={() => props.sortByTag('all')} className='tag btn btn-md btn-success'>All</button>
            {TagButtonList}
        </div>
    )
}

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
        this.props.apiStore.getUserRecipes(this.props.user_id);
    }

    render() {
        var buttonStyle = {
            display: "inline",
            verticalAlign: "top"
        }

        const recipeCardsContainerClassName = classNames({
            [styles.recipeCardsContainer]: true,
        });

        return (
            <div>
                {(this.state.loading === false) ? (
                    <div className='text-center'>
                        <h2>There doesn't seem to be anything here...</h2><br/>
                        <h2 style={buttonStyle}>Get started by </h2>
                        <Link to={'/browse'} style={buttonStyle} className='btn btn-md btn-success'>browsing existing
                            recipes</Link>
                        <h2 style={buttonStyle}> or </h2>
                        <Link style={buttonStyle} className='btn btn-success btn-md' to={'/add'}>adding a recipe.</Link>
                    </div>
                ) : (
                    <div>
                        <div className={recipeCardsContainerClassName}>
                            {/*<TagFilter tags={this.props.tags} sortByTag={this.sortByTag}/>*/}
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

