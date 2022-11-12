import React, {useContext} from 'react';
import {ApiStoreContext} from "../../stores/api_store";
import classNames from "classnames";
import styles from "./styles/Header.module.scss";
import Button from "../utilities/buttons/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faImage, faSearch} from "@fortawesome/free-solid-svg-icons";
import Rating from "react-rating";
import {getCdnImageUrl} from "../../utils/images";

const SearchBar = React.forwardRef((props, ref) => {
    const context = useContext(ApiStoreContext);

    const searchClassName = classNames({
        [styles.search]: true,
        [styles.searchOpen]: props.searchOpen,
    });

    return <div className={searchClassName} ref={ref}>
        <Button onClick={() => props.setSearchOpen(v => !v)}>
            <FontAwesomeIcon icon={faSearch}/>
        </Button>
        <input placeholder={"Search"} value={props.searchTerm} onChange={e => props.setSearchTerm(e.target.value)}/>
        {props.searchOpen && props.foundRecipes.length > 0 && <div className={styles.recipeSearch}>
            <ul>
                {props.foundRecipes.map(recipe => {
                    return <li>
                        <Button onClick={async () => await context.openRecipeModal(recipe.id)}>
                            {recipe.image ? <img src={getCdnImageUrl(recipe.image)} alt={"Recipe Image"}/> :
                                <div className={styles.noImage}><FontAwesomeIcon icon={faImage}/></div>}
                            <div>
                                <span>{recipe.name}</span>
                                {recipe.total_ratings > 0 && <Rating
                                    readonly={true}
                                    quiet={true}
                                    initialRating={recipe.avg_rating}
                                    fractions={2}
                                    emptySymbol={"far fa-star"}
                                    fullSymbol="fas fa-star"
                                />}
                            </div>
                        </Button>
                    </li>
                })}
            </ul>
        </div>}
    </div>
});

export default SearchBar;
