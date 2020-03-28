import React, {useState, useRef, useContext, useEffect} from 'react';
import ReactDOM from 'react-dom';
import styles from "./Popup.module.scss";
import Router from 'next/router';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {useSpring, animated} from "react-spring";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {ApiStoreContext} from "../../stores/api_store";

const tour = [
    {
        url: "/",
        popups: [
            {
                elementClass: 'recipe-card',
                elementIndex: 1,
                marginLeft: 50,
                marginTop: 50,
                message: "On the home page you can browse all of the recipes on Ediblio. Once you've created an account, hovering your mouse over a recipe will open a toolbar for saving it and adding it to your grocery list."
            }
        ]
    },
    {
        url: '/tour/sample-recipe',
        popups: [
            {
                message: "A recipe in Ediblio can either serve as a full ingredient list and description, or just a list of ingredients for adding to your grocery list.",
                elementClass: 'tour-recipe',
                marginLeft: 25,
            }, {
                elementClass: 'tour-ingredients',
                message: "You can either add all of the recipe's ingredients to your grocery list, or uncheck items to only add some. You can also edit items in the recipe, for example if you already have some or you prefer something different.",
                marginLeft: -450,
            }
        ]
    },
    {
        url: '/tour/sample-groceries',
        popups: [
            {
                elementClass: 'tour-menu',
                message: "When you add recipes to your grocery list, they'll appear in your menu here.",
                marginLeft: 200,
            },
            {
                elementClass: 'tour-staples',
                message: "Once you've made a few grocery lists, the groceries that you add frequently will start appearing here so you can add them quickly.",
                marginLeft: 250,
                marginTop: -50,
            },
            {
                elementClass: 'tour-ingredients',
                message: "Here you can add new ingredients to your grocery list. Simply type in what you want to add, like '1 gallon milk' or '1/2 tsp cumin', and press enter to add an ingredient. " +
                    "You can drag and drop groceries to reorder your list, or click the pen to edit them.",
                marginLeft: 350,
                marginTop: 100,
            },
            {
                elementClass: 'tour-storemode',
                message: "Toggle store mode for a simplified view that works best on your phone. Check off items as you go, and remove them from your list as needed.",
                marginTop: 150,
                marginLeft: 300,
            }
        ]
    },
    {
        url: '/tour/sample-profile',
        popups: [
            {
                elementClass: 'tour-banner',
                message: "This is what yours or others' recipe pages look like. It's all of the recipes you've submitted, as well as all your collections and all the collections you follow.",
                marginLeft: 700,
            },
            {
                elementClass: 'tour-collection',
                elementIndex: 1,
                message: "Collections provide an easy way to group common recipes however way you'd like. You can create your own collections or follow others'. Every user starts out with a 'Favorites' collection to get them started.",
                marginTop: -220,
            }
        ]
    },
    {
        url: '/add',
        popups: [
            {
                elementClass: 'tour-submit',
                message: "Here you can add new recipes, either from online, a cookbook, or your own creations. When you add a link, we'll search that website for a suitable picture. If we can't find one, you may need to upload your own.",
                marginLeft: 200,
            },
            {
                elementClass: 'tour-ingredients',
                message: "This ingredients form functions just like your grocery list and provides an easy way to enter or copy ingredients for your recipe.",
                marginLeft: 170,
                marginTop: 100,
            }
        ]
    },
    {
        url: '/',
        popups: [
            {
                elementClass: 'recipe-card',
                elementIndex: 1,
                marginLeft: 50,
                marginTop: 50,
                message: "That about sums it up! There's lots of new features added regularly, and lots we weren't able to cover, but we hope you are excited to get started!"
            }
        ]
    }
];

class TourPopup extends React.Component {
    constructor(props) {
        super(props);

        this.popupRef = React.createRef();

        this.state = {
            text: props.text,
            onNext: props.onNext,
            visible: true,
        }
    }

    getDomNode = () => {
        if (this.popupRef.current) {
            return this.popupRef.current;
        }
        return {};
    };

    transform = (x, y) => {
        this.popupRef.current.style.transform = `translateY(${y}px) translateX(${x}px)`;
    };

    setText = text => {
        this.setState({
            text,
        })
    };

    setOnNext = onNext => {
        this.setState({
            onNext,
        })
    };

    close = () => {
        document.body.style.overflow = 'auto';
        this.setState({
            visible: false,
        })
    };

    render() {
        const popupClassName = classNames({
            [styles.tourLoc]: true,
            [styles.tourLocClosed]: !this.state.visible,
        });

        return <div className={popupClassName}>
            <div ref={this.popupRef}
                    style={{top: `${this.props.top}px`, left: `${this.props.left}px`}}>
            <button onClick={this.close}><FontAwesomeIcon icon={faTimes}/></button>
            <p id={'tour-popup'}>{this.state.text}</p>
            <button onClick={this.state.onNext}>Next</button>
        </div>
        </div>
    }
}

TourPopup.propTypes = {
    text: PropTypes.string.isRequired,
    onNext: PropTypes.func.isRequired,
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
};

function getElementAttributes(anchor) {
    const marginLeft = anchor.marginLeft || 0;
    const marginTop = anchor.marginTop || 0;

    const elements = document.getElementsByClassName(anchor.elementClass);
    const elementPos = elements[anchor.elementIndex || 0].getBoundingClientRect();

    return {top: elementPos.top + marginTop, x: elementPos.x + marginLeft};
}

export default function Popup(props) {
    const [onTour, setOnTour] = useState(false);
    const context = useContext(ApiStoreContext);
    const popupRef = useRef(null);

    async function goToNextPage(pageIndex) {
        const currentPage = tour[pageIndex];
        await Router.push(currentPage.url);
        const container = document.createElement('span');
        document.body.appendChild(container);

        async function goToNextPopup(anchorIndex) {
            if (popupRef.current && anchorIndex > 0 && anchorIndex < currentPage.popups.length) {
                // should trigger if there is already a popup on the current page
                const {top, x} = getElementAttributes(currentPage.popups[anchorIndex]);

                const oldPosition = popupRef.current.getDomNode().getBoundingClientRect();
                const diffTop = top - oldPosition.top;
                const diffLeft = x - oldPosition.x;
                popupRef.current.transform(diffLeft, diffTop);
                popupRef.current.setText(currentPage.popups[anchorIndex].message);
                popupRef.current.setOnNext(() => goToNextPopup(anchorIndex + 1));

            } else if (anchorIndex === 0) {
                const {top, x} = getElementAttributes(currentPage.popups[anchorIndex]);

                const popup = <TourPopup ref={popupRef} text={currentPage.popups[anchorIndex].message}
                                         onNext={() => goToNextPopup(anchorIndex + 1)} top={top} left={x}/>
                setTimeout(() => {
                    ReactDOM.render(popup, container);
                }, 250);
            } else {
                // go to next page
                document.body.removeChild(container);

                if (tour.length > pageIndex + 1) {

                    goToNextPage(pageIndex + 1)
                } else {
                    // end tour
                    popupRef.current.close();

                    context.addModal('login');
                }
            }
        }

        goToNextPopup(0);
    }

    function startTour() {
        document.body.style.overflow = 'hidden';
        goToNextPage(0);
        setOnTour(true);
    }

    const popupClassName = classNames({
        [styles.container]: true,
        [styles.containerHidden]: onTour,
    });

    const [mounted, setMounted] = useState(false);
    const {x} = useSpring({
        from: {x: 0},
        x: mounted ? 1 : 0,
        config: {duration: 1000}
    });

    useEffect(() => setMounted(true), []);

    return <div className={popupClassName}>
        <animated.div
            style={{
                opacity: x.interpolate({range: [0, 1], output: [0.3, 1]}),
                transform: x
                    .interpolate({
                        range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
                        output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1]
                    })
                    .interpolate(x => `scale(${x})`)
            }}>
            New to Ediblio?
            <button onClick={startTour}>Take the Tour!</button>
        </animated.div>
    </div>

}
