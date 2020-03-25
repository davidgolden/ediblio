import React, {useState} from 'react';
import {Editor, EditorState, ContentState, RichUtils} from 'draft-js';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "./buttons/Button";
import {faBold, faItalic, faListOl, faListUl, faQuoteLeft, faUnderline} from "@fortawesome/free-solid-svg-icons";
import styles from './styles/DraftEditor.module.scss';

export default function DraftEditor(props) {
    const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText(props.value || "Hello World")));

    return <div>
        <div className={styles.controlBar}>
            <Button onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'))}><FontAwesomeIcon icon={faBold} /></Button>
            <Button onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'))}><FontAwesomeIcon icon={faItalic} /></Button>
            <Button onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'))}><FontAwesomeIcon icon={faUnderline} /></Button>
            <Button onClick={() => setEditorState(RichUtils.toggleBlockType(editorState, 'unordered-list-item'))}><FontAwesomeIcon icon={faListUl} /></Button>
            <Button onClick={() => setEditorState(RichUtils.toggleBlockType(editorState, 'ordered-list-item'))}><FontAwesomeIcon icon={faListOl} /></Button>
            <Button onClick={() => setEditorState(RichUtils.toggleBlockType(editorState, 'blockquote'))}><FontAwesomeIcon icon={faQuoteLeft} /></Button>
        </div>
        <div className={styles.editor}>
        <Editor editorState={editorState} onChange={s => setEditorState(s)} />
        </div>
    </div>
}

DraftEditor.propTypes = {
    value: PropTypes.string.isRequired,
};
