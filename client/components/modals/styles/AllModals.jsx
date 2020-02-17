import React, {useContext} from 'react';
import {observer} from "mobx-react";
import {ApiStoreContext} from "../../../stores/api_store";
import InstallPromptModal from "../InstallPromptModal";
import LoginModal from "../LoginModal";

const AllModalTypes = {
    'installPrompt': InstallPromptModal,
    'login': LoginModal,
};

const AllModals = observer(props => {
    const context = useContext(ApiStoreContext);
    const [didMount, setDidMount] = React.useState(false);
    React.useLayoutEffect(() => setDidMount(true), []);

    if (didMount) {
        return context.modalStack.map((modalType, i) => {
            const ModalComponent = AllModalTypes[modalType];
            return <ModalComponent key={i}/>
        })
    } else {
        return <div />
    }
});

export default AllModals;
