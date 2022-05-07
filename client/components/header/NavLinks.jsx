import React, {useContext} from 'react';
import {observer} from "mobx-react";
import {ApiStoreContext} from "../../stores/api_store";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBook, faListUl, faPlus, faSearch, faSignOutAlt, faUser} from "@fortawesome/free-solid-svg-icons";

const NavLinks = observer((props) => {
    const context = useContext(ApiStoreContext);

    return <ul>
        <li>
            <Link href={"/"}>
                <a>
                    <FontAwesomeIcon icon={faSearch}/> Browse Recipes
                </a>
            </Link>
        </li>
        <li>
            <Link href={"/users/[user_id]/groceries"}
                  as={`/users/${context.user.id}/groceries`}>
                <a>
                    <FontAwesomeIcon icon={faListUl}/> Grocery List
                </a>
            </Link>
        </li>
        <li>
            <Link href={'/add'}>
                <a>
                    <FontAwesomeIcon icon={faPlus}/> Add Recipe
                </a>
            </Link>
        </li>
        <li>
            <Link href={"/users/[user_id]/recipes"} as={`/users/${context.user.id}/recipes`}>
                <a>
                    <FontAwesomeIcon icon={faBook}/> My Recipes
                </a>
            </Link>
        </li>
        <li>
            <Link href={"/users/[user_id]/settings"} as={`/users/${context.user.id}/settings`}>
                <a>
                    <FontAwesomeIcon icon={faUser}/> Settings
                </a>
            </Link>
        </li>
        <li>
            <button onClick={context.userLogout}><FontAwesomeIcon icon={faSignOutAlt}/> Log
                Out
            </button>
        </li>
    </ul>
})

export default NavLinks;
