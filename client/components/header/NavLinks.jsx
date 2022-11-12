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
                <FontAwesomeIcon icon={faSearch}/> Browse Recipes
            </Link>
        </li>
        <li>
            <Link href={"/users/[user_id]/groceries"}
                  as={`/users/${context.user.id}/groceries`}>
                <FontAwesomeIcon icon={faListUl}/> Grocery List
            </Link>
        </li>
        <li>
            <Link href={'/add'}>
                <FontAwesomeIcon icon={faPlus}/> Add Recipe
            </Link>
        </li>
        <li>
            <Link href={"/users/[user_id]/recipes"} as={`/users/${context.user.id}/recipes`}>
                <FontAwesomeIcon icon={faBook}/> My Recipes
            </Link>
        </li>
        <li>
            <Link href={"/users/[user_id]/settings"} as={`/users/${context.user.id}/settings`}>
                <FontAwesomeIcon icon={faUser}/> Settings
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
