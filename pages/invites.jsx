import React, {useState} from "react";
import {clientFetch, getUrlParts} from "../client/utils/cookies";
import loginModalStyles from "../client/components/modals/styles/LoginModal.module.scss";
import styles from "./styles/Invites.module.scss";
import axios from "axios";
import classNames from 'classnames';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

const Invites = (props) => {
    const [invites, setInvites] = useState(props.invites);
    const [inviteEmail, setInviteEmail] = useState("");

    async function inviteUser() {
        const response = await clientFetch.post("/api/invites", {
            email: inviteEmail,
        });
        setInviteEmail("");
        setInvites(v => [...v, response.data.invite])
    }

    async function deleteInvite(inviteId) {
        await clientFetch.delete(`/api/invites/${inviteId}`);
        setInvites(v => v.filter(i => i.id !== inviteId));
    }

    const containerClassName = classNames({
        [loginModalStyles.container]: true,
        [styles.container]: true,
    })

    return <div className={containerClassName}>
        <div>
            <h2>Invited Users</h2>
            <table>
                <tr>
                    <th>
                        Email
                    </th>
                    <th>
                        Token
                    </th>
                    <th>
                        Claimed
                    </th>
                    <th>Delete</th>
                </tr>
                {invites.map(invite => {
                    return <tr>
                        <td>{invite.email}</td>
                        <td>{invite.id}</td>
                        <td>{invite.claimed ? "Y" : "N"}</td>
                        <td><button onClick={() => deleteInvite(invite.id)}><FontAwesomeIcon icon={faTrash} /></button></td>
                    </tr>
                })}
            </table>
            <input placeholder={"Enter Email Address"} type={"email"} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}/>
            <button className={styles.inviteButton} onClick={inviteUser}>Send Invite</button>
        </div>
    </div>
}

export async function getServerSideProps({req}) {
    const {currentBaseUrl, jwt} = getUrlParts(req);

    const response = await axios.get(`${currentBaseUrl}/api/invites`, {
        headers: jwt ? {'x-access-token': jwt} : {},
    });

    return {
        props: {
            invites: response.data.invites,
        }
    }
}

export default Invites;