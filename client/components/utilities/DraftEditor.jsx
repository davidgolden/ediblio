import React, {useState, useRef} from 'react';
import {Editor, EditorState, ContentState, RichUtils} from 'draft-js';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "./buttons/Button";
import {faBold, faItalic, faListOl, faListUl, faQuoteLeft, faUnderline} from "@fortawesome/free-solid-svg-icons";
import styles from './styles/DraftEditor.module.scss';
import classNames from 'classnames';

function StyleButton(props) {
    const styleButtonClassName = classNames({
        [styles.styleButton]: true,
        [styles.styleButtonActive]: props.active,
    });

    function handleToggle(e) {
        e.preventDefault();
        props.handleToggle(props.type)
    }

    return <button className={styleButtonClassName} onMouseDown={handleToggle}><FontAwesomeIcon icon={props.icon} /></button>
}
StyleButton.propTypes = {
    handleToggle: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
};

function BlockStyleButton(props) {
    const selection = props.editorState.getSelection();
    const blockType = props.editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return <StyleButton {...props} active={props.type === blockType} />
}

function InlineStyleButton(props) {
    const currentStyle = props.editorState.getCurrentInlineStyle();

    return <StyleButton {...props} active={currentStyle.has(props.type)} />
}

const inlineStyleTypes = [['BOLD', faBold], ['ITALIC', faItalic], ['UNDERLINE', faUnderline]];
const blockTypes = [['unordered-list-item', faListUl], ['ordered-list-item', faListOl], ['blockquote', faQuoteLeft]];

export default function DraftEditor(props) {
    const editorRef = useRef(null);
    const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText(props.value || "Hello World")));

    function setFocus(e) {
        if (editorRef.current) {
            editorRef.current.focus();
        }
    }

    function toggleBlockType(blockType) {
        setEditorState(RichUtils.toggleBlockType(editorState, blockType))
    }

    function toggleInlineStyle(style) {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style))
    }

    return <div>
        <div className={styles.controlBar}>
            {inlineStyleTypes.map(t => <InlineStyleButton editorState={editorState} handleToggle={toggleInlineStyle} type={t[0]} icon={t[1]} />)}
            {blockTypes.map(t => <BlockStyleButton editorState={editorState} handleToggle={toggleBlockType} type={t[0]} icon={t[1]} />)}
        </div>
        <div className={styles.editor} onClick={setFocus}>
        <Editor editorState={editorState} onChange={s => setEditorState(s)} ref={editorRef} />
        </div>
    </div>
}

DraftEditor.propTypes = {
    value: PropTypes.string.isRequired,
};
