import React from 'react';
import Store from "../store";

export const initialStore = new Store();

export const ApiStoreContext = React.createContext(initialStore);
