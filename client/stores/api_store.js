import React from 'react';
import Store from "./store";

export const storeSingleton = new Store();

export const ApiStoreContext = React.createContext(storeSingleton);

export function loadStore() {
    return new Store();
}
