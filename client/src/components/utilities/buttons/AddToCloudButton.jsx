import React, {useContext, useState, useEffect} from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {ApiStoreContext} from "../../../stores/api_store";

const AddToCloudButton = props => {

    const context = useContext(ApiStoreContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [createNew, setCreateNew] = useState(false);
    const [collectionName, setCollectionName] = useState("");

    const removeButtonClassName = classNames({
        [styles.addButton]: true,
        [styles.addButtonDisabled]: props.disabled,
        [props.className]: props.className,
    });
    const collectionDialogClassName = classNames({
        [styles.collectionDialog]: true,
    });

    function handleKeyDown(e) {
        if (e.which === 13 && dialogOpen && createNew && collectionName) {
            context.createCollection(collectionName);
            setCreateNew(false);
            setCollectionName("");
        }
    }

    useEffect(() => {
        addEventListener('keydown', handleKeyDown);
        return () => removeEventListener('keydown', handleKeyDown);
    });

    return (
        <div onMouseLeave={() => setDialogOpen(false)} className={collectionDialogClassName}>
            <Button onMouseOver={() => setDialogOpen(true)} className={removeButtonClassName}>
                <FontAwesomeIcon icon={faPlus}/>
            </Button>
            {dialogOpen && <div>
                <ul>
                    {context.user.collections.map(c => {
                        const inCollection = c.recipes.find(r => r._id === props.recipe_id);
                        return <li key={c._id}>
                            <Button onClick={() => {
                                if (inCollection) {
                                    props.removeFromCollection(c._id, props.recipe_id);
                                } else {
                                    props.addToCollection(c.name);
                                }
                            }}>
                                {inCollection ? "Remove from " : "Add to "}
                                {c.name}
                            </Button>
                        </li>
                    })}
                </ul>
                {createNew ? <input placeholder={"Collection Name"} value={collectionName}
                                    onChange={e => setCollectionName(e.target.value)}/> :
                    <Button onClick={() => setCreateNew(true)}>Create New Collection</Button>}
            </div>}
        </div>
    )
};

export default AddToCloudButton;
