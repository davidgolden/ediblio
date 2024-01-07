import Checkbox from "../utilities/Checkbox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt, faCalendarDays} from "@fortawesome/free-solid-svg-icons";
import React, {useContext} from "react";
import {ApiStoreContext} from "../../stores/api_store";
import {clientFetch} from "../../utils/cookies";
import {observer} from "mobx-react";

function getWeekday(date) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date];
}

function getDateString(utcDate) {
    const date = new Date(utcDate);
    return `${getWeekday(date.getDay())} ${date.getMonth() + 1}/${date.getDate()}`;
}

export const MenuItem = observer((props) => {
    const context = useContext(ApiStoreContext);

    async function handleDateChange(e) {
        const response = await clientFetch.patch(`/api/users/${context.user.id}/menu/${props.item.menu_id}`, {
            date: e.target.value,
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
        - <label
        onClick={() => document.getElementById(`date-${props.item.menu_id}`).showPicker()}
        htmlFor={`date-${props.item.menu_id}`}>
        {props.item.date ? getDateString(props.item.date) : <FontAwesomeIcon icon={faCalendarDays} />}
    </label>
        <input
            id={`date-${props.item.menu_id}`}
            style={{visibility: "hidden", width: 0}}
            value={props.item.date ? new Date(props.item.date).toISOString().substr(0, 10) : ""}
            type={"date"}
            onChange={handleDateChange}
        />
        {externalLink && <a target='_blank' href={externalLink}>
            <FontAwesomeIcon icon={faExternalLinkAlt}/>
        </a>}
    </li>
})