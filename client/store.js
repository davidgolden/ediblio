import React from "react";
import axios from "axios";
import './stylesheets/base.scss';
import {observable, action, autorun, toJS} from "mobx";
import Router from 'next/router';

export default class Store {

    constructor() {
        if (typeof window !== 'undefined') {
            this.fetchMeasurements();
            this.loadUserFromLocalStorage();
            autorun(() => {
                localStorage.setItem("user", JSON.stringify(toJS(this.user)));
            });

            // open prompt if never visited or not visited in past 24 hours
            if (localStorage.getItem('hasInstallPromptRun') === null || localStorage.getItem('hasInstallPromptRun') > 1000 * 60 * 60 * 24) {
                localStorage.setItem('hasInstallPromptRun', Date.now().toString());
                this.checkIfShouldShowInstallPrompt();
            }
        }
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

    @action
    loadUserFromLocalStorage() {
        const userJson = localStorage.getItem("user");
        if (userJson) {
            this.user = JSON.parse(userJson);
        }
    }

    @observable user = null;
    @observable notificationMessage = '';
    @observable notificationType = '';

    @observable modalStack = [];

    @observable measurements = [];

    @action
    fetchMeasurements = async () => {
        const response = await axios.get('/api/measurements');
        this.measurements = response.data.measurements;
    };

    @action
    addModal = (type) => {
        this.modalStack.push(type)
    };

    @action
    removeTopModal = () => {
        this.modalStack.pop();
    };

    handleError = error => {
        this.notificationMessage = 'Oops! ' + error;
        this.notificationType = 'error';
        setTimeout(() => {
            this.notificationMessage = '';
            this.notificationType = '';
        }, 4000);
    };

    @action
    userLogin = (email, password) => {
        axios.post('/api/login', {
            email: email,
            password: password,
        }, {
            withCredentials: true,
        })
            .then(response => {
                this.user = response.data.user;
            })
            .catch(err => {
                this.handleError(err.response.data.detail);
            })
    };

    @action
    userLogout = () => {
        axios.get('/api/logout')
            .then(() => {
                this.user = null;
                // localStorage.setItem('jwt', null);
            });
    };

    getCollectionRecipes = async (collectionId, query) => {
        const response = await axios.get(`/api/collections/${collectionId}`, query);
        return response.data.collection;
    };

    getRecipes = params => {
        // accepted params: author, tags, page, page_size
        const requestParams = params;
        return new Promise((res, rej) => {
            axios.get('/api/recipes', {
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

    @action
    createCollection = name => {
        return new Promise((res, rej) => {
            axios.post(`/api/collections`, {name})
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

    @action
    deleteCollection = async id => {
        return new Promise((res, rej) => {
            axios.delete(`/api/collections/${id}`)
                .then(response => {
                    this.user = response.data.user;
                    res();
                })
                .catch(rej)
        })
    };

    createRecipe = recipe => {
        return new Promise((res, rej) => {
            axios.post('/api/recipes', {
                recipe: recipe,
            })
                .then(response => {
                    // do something
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                })
        })
    };

    deleteRecipe = id => {
        return new Promise((res, rej) => {
            axios.delete(`/api/recipes/${id}`)
                .then(() => {
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                })
        });
    };

    @action
    registerUser = user => {
        return new Promise((res, rej) => {
            axios.post('/api/users', {...user})
                .then(response => {
                    this.user = response.data.user;
                    Router.push("/");
                    res();
                })
                .catch(err => {
                    this.handleError(err.response.data.detail);
                    rej();
                })
        })
    };

    patchRecipe = (id, partialRecipeObj) => {
        return new Promise((res, rej) => {
            axios.patch(`/api/recipes/${id}`, {
                ...partialRecipeObj
            })
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
            axios.post('/api/reset', {
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
            axios.post('/api/forgot', {
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
