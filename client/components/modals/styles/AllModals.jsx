import React, {useContext} from 'react';
import {observer} from "mobx-react";
import {ApiStoreContext} from "../../../stores/api_store";
import dynamic from "next/dynamic";

const AllModalTypes = {
    'installPrompt': dynamic(() => import("../InstallPromptModal")),
    'login': dynamic(() => import("../LoginModal")),
    'recipe': dynamic(() => import("../RecipeModal")),
};

const AllModals = observer(props => {
    const context = useContext(ApiStoreContext);

    return context.modalStack.map((modalType, i) => {
        const ModalComponent = AllModalTypes[modalType];
        return <ModalComponent key={i}/>
    })
});

export default AllModals;
