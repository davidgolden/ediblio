import React from "react";
import {set, makeAutoObservable} from "mobx";
import cookie from 'js-cookie';
import {clientFetch} from "../utils/cookies";
import {SignJWT} from "jose";

class JsonWebToken {
    async encode(payload) {
        const secret = new TextEncoder().encode("my-password");
        return await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .sign(secret)
    }
}

export default class Store {

    constructor() {
        if (typeof window !== 'undefined') {
            this.fetchMeasurements();

            // open prompt if never visited or not visited in past 24 hours
            if (localStorage.getItem('hasInstallPromptRun') === null || localStorage.getItem('hasInstallPromptRun') > 1000 * 60 * 60 * 24) {
                localStorage.setItem('hasInstallPromptRun', Date.now().toString());
                this.checkIfShouldShowInstallPrompt();
            }
        }

        makeAutoObservable(this);
    }

    checkIfShouldShowInstallPrompt = () => {
        // Detects if device is on iOS
        const isIos = function () {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        };
        // Detects if device is in standalone mode
        const isInStandaloneMode = function () {
            return ('standalone' in window.navigator) && (window.navigator.standalone);
        };

        // Opera 8.0+
        const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        // Firefox 1.0+
        const isFirefox = typeof InstallTrigger !== 'undefined';
        // Safari 3.0+ "[object HTMLElementConstructor]"
        const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;
        // Edge 20+
        const isEdge = !isIE && !!window.StyleMedia;
        // Chrome 1 - 71
        const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
        // Edge (based on chromium) detection
        const isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
        // Blink engine detection
        const isBlink = (isChrome || isOpera) && !!window.CSS;
        var ua = window.navigator.userAgent;
        var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
        var webkit = !!ua.match(/WebKit/i);
        var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

        if (!isInStandaloneMode() && isIos() && isSafari) {
            this.addModal("installPrompt");
        }
    };

    loadUserFromLocalStorage() {
        const userJson = localStorage.getItem("user");
        if (userJson) {
            const user = JSON.parse(userJson);
            for (let k in user) {
                if (user.hasOwnProperty(k)) {
                    this.user[k] = user[k];
                }
            }
        }
    }

    setUser(user) {
        for (let k in user) {
            if (user.hasOwnProperty(k)) {
                this.user[k] = user[k];
            }
        }
    }

    setMenu(menu) {
        this.menu = menu;
    }

    setGroceryList(groceryList) {
        this.groceryList = groceryList;
    }

    get loggedIn() {
        return !!this.user?.id;
    }

    menu = [];
    groceryList = [];
    user = {};
    notificationMessage = '';
    notificationType = '';

    modalStack = [];

    measurements = [];

    recipes = new Map([]);

    addRecipes(r, clear = false) {
        if (clear) {
            this.recipes.clear();
        }
        r.forEach(recipe => set(this.recipes, recipe.id, recipe));
    }

    removeRecipe(id) {
        this.recipes.delete(id);
    }

    fetchMeasurements = async () => {
        const response = await clientFetch.get('/api/measurements');
        this.measurements = response.data.measurements;
    };

    addModal = (type) => {
        this.modalStack.push(type)
    };

    removeTopModal = () => {
        this.modalStack.pop();
    };

    baseURL = "";

    openRecipeModal = async (id) => {
        this.baseURL = window.location.href;
        window.history.pushState({}, document.title, `/recipes/${id}`);
        this.addModal('recipe');
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    };

    closeRecipeModal = async () => {
        document.getElementsByTagName('body')[0].style.overflow = 'auto';
        window.history.pushState({}, document.title, this.baseURL);
    };

    handleError = error => {
        this.notificationMessage = 'Oops! ' + error;
        this.notificationType = 'error';
        setTimeout(() => {
            this.notificationMessage = '';
            this.notificationType = '';
        }, 4000);
    };

    userLogin = async (email, password) => {
        const jwt = await new JsonWebToken().encode({email, password, redirect_url: window.location.pathname});
        window.location.href = '/api/login?jwt='+jwt;
    };

    userLogout = async () => {
        this.user = {};
        localStorage.setItem('jwt', null);
        cookie.remove('jwt');
        await clientFetch.post('/api/logout');
    };

    getCollectionRecipes = async (collectionId, query) => {
        const response = await clientFetch.get(`/api/collections/${collectionId}`, query);
        return response.data.collection;
    };

    getRecipes = params => {
        // accepted params: author, tags, page, page_size
        const requestParams = params;
        return new Promise((res, rej) => {
            clientFetch.get('/api/recipes', {
                params: requestParams,
            })
                .then(response => {
                    return res(response.data.recipes);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        })
    };

    createCollection = name => {
        return new Promise((res, rej) => {
            clientFetch.post(`/api/collections`, {name})
                .then(response => {
                    this.user = response.data.user;
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        });
    };

    deleteCollection = async id => {
        return new Promise((res, rej) => {
            clientFetch.delete(`/api/collections/${id}`)
                .then(response => {
                    this.user = response.data.user;
                    res();
                })
                .catch(rej)
        })
    };

    createRecipe = recipe => {
        return new Promise((res, rej) => {
            clientFetch.post('/api/recipes', recipe)
                .then(response => {
                    // do something
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        })
    };

    deleteRecipe = id => {
        return new Promise((res, rej) => {
            clientFetch.delete(`/api/recipes/${id}`)
                .then(() => {
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        });
    };

    patchRecipe = (id, partialRecipeObj) => {
        return new Promise((res, rej) => {
            clientFetch.patch(`/api/recipes/${id}`, partialRecipeObj)
                .then(response => {
                    res(response.data.recipe);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        });
    };

    resetPassword = (token, newPassword) => {
        return new Promise((res, rej) => {
            clientFetch.post('/api/reset', {
                token: token,
                newPassword: newPassword,
            })
                .then(response => {
                    return res(response.data);
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                })
        })
    };

    forgotPassword = email => {
        return new Promise((res, rej) => {
            clientFetch.post('/api/forgot', {
                email: email,
            })
                .then(response => {
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej(err);
                })
        })
    };
}
