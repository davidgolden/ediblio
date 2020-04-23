import React, {useContext} from 'react';
import {observer} from "mobx-react";
import {ApiStoreContext} from "../../../stores/api_store";
import InstallPromptModal from "../InstallPromptModal";
import LoginModal from "../LoginModal";
import RecipeModal from "../RecipeModal";

const AllModalTypes = {
    'installPrompt': InstallPromptModal,
    'login': LoginModal,
    'recipe': RecipeModal,
};

const AllModals = observer(props => {
    const context = useContext(ApiStoreContext);

    return context.modalStack.map((modalType, i) => {
        const ModalComponent = AllModalTypes[modalType];
        return <ModalComponent key={i}/>
    })
});

export default AllModals;
