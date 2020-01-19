import React from 'react';
import Modal from "./Modal";
import styles from './styles/InitialPromptModal.scss';

export default function InstallPromptModal(props) {
    return <Modal className={styles.container}>
        <div className={styles.exampleIcons}>
            <svg>
                <rect width={50} height={50} fill={"#EDEDED"} />
            </svg>
            <svg>
                <rect width={50} height={50} fill={"#EDEDED"} />
            </svg>
            <img src={"/images/cloud192x192.png"} />
            <svg>
                <rect width={50} height={50} fill={"#EDEDED"} />
            </svg>
            <svg>
                <rect width={50} height={50} fill={"#EDEDED"} />
            </svg>
        </div>
        Install this webapp on your iPhone: tap
        <svg xmlns="http://www.w3.org/2000/svg" id="Capa_1" enableBackground="new 0 0 551.13 551.13" height="30"
             viewBox="0 0 551.13 551.13" width="40" fill={"#00bfff"} style={{verticalAlign: 'bottom'}}>
            <path
                d="m465.016 172.228h-51.668v34.446h34.446v310.011h-344.457v-310.011h34.446v-34.446h-51.669c-9.52 0-17.223 7.703-17.223 17.223v344.456c0 9.52 7.703 17.223 17.223 17.223h378.902c9.52 0 17.223-7.703 17.223-17.223v-344.456c0-9.52-7.703-17.223-17.223-17.223z"/>
            <path
                d="m258.342 65.931v244.08h34.446v-244.08l73.937 73.937 24.354-24.354-115.514-115.514-115.514 115.514 24.354 24.354z"/>
        </svg>
        and then "Add to Homescreen"
    </Modal>
}
