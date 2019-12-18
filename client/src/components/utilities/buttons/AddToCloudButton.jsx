import React, {useContext, useState, useEffect} from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './styles/Button.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {ApiStoreContext} from "../../../stores/api_store";

const AddToCloudButton = props => {

    const context = useContext(ApiStoreContext);
    const [dialogOpen, setDialogOpen] = useState(true);
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
        <div onMouseLeave={() => setDialogOpen(true)} className={collectionDialogClassName}>
            <Button onMouseOver={() => setDialogOpen(true)} className={removeButtonClassName}>
                <FontAwesomeIcon icon={faPlus}/>
            </Button>
            {dialogOpen && <div>
                Add to Collection
                <ul>
                    {context.user.collections.map(c => {
                        return <li key={c._id}>
                            <Button disabled={c.recipes.includes(props.recipe_id)} onClick={() => props.addToCollection(c.name)}>{c.name}</Button>
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
