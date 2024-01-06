import Checkbox from "../utilities/Checkbox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import React, {useContext} from "react";
import {ApiStoreContext} from "../../stores/api_store";
import {clientFetch} from "../../utils/cookies";
import {observer} from "mobx-react";

export const MenuItem = observer((props) => {
    const context = useContext(ApiStoreContext);

    async function handleDateChange(e) {
        const response = await clientFetch.patch(`/api/users/${context.user.id}/menu/${props.item.menu_id}`, {
            date: e.target.value
        });
        const menuItem = context.menu.find(m => m.menu_id === props.item.menu_id);
        menuItem.date = response.data.date;
    }

    let itemDisplay, externalLink;
    if (props.item.menu_name) {
        itemDisplay = <span>{props.item.menu_name}</span>
    } else {
        itemDisplay = <button onClick={() => context.openRecipeModal(props.item.id)}>{props.item.name}</button>
    }

    if (props.item.url) {
        externalLink = props.item.url;
    } else if (/^http/.exec(props.item.menu_name)) {
        externalLink = props.item.menu_name;
    }

    return <li key={props.item.id}>
        {props.storeMode || <Checkbox checked={props.checked}
                                      onChange={props.onCheck}/>}
        {itemDisplay}
        -<input
        value={props.item.date ? new Date(props.item.date).toISOString().substr(0, 10) : ""}
        type={"date"}
        onChange={handleDateChange}
    />
        {externalLink && <a target='_blank' href={externalLink}>
            <FontAwesomeIcon icon={faExternalLinkAlt}/>
        </a>}
    </li>
})