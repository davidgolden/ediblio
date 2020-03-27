import React, {useState, useRef, useCallback} from 'react';
import {Editor, EditorState, ContentState, RichUtils, convertToRaw, convertFromRaw} from 'draft-js';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBold, faItalic, faListOl, faListUl, faQuoteLeft, faUnderline} from "@fortawesome/free-solid-svg-icons";
import styles from './styles/DraftEditor.module.scss';
import classNames from 'classnames';
import {draftToMarkdown, markdownToDraft} from "markdown-draft-js";

function StyleButton(props) {
    const styleButtonClassName = classNames({
        [styles.styleButton]: true,
        [styles.styleButtonActive]: props.active,
    });

    function handleToggle(e) {
        e.preventDefault();
        props.handleToggle(props.type)
    }

    return <button className={styleButtonClassName} onMouseDown={handleToggle}><FontAwesomeIcon icon={props.icon}/>
    </button>
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

    return <StyleButton {...props} active={props.type === blockType}/>
}

function InlineStyleButton(props) {
    const currentStyle = props.editorState.getCurrentInlineStyle();

    return <StyleButton {...props} active={currentStyle.has(props.type)}/>
}

const inlineStyleTypes = [['BOLD', faBold], ['ITALIC', faItalic], ['UNDERLINE', faUnderline]];
const blockTypes = [['unordered-list-item', faListUl], ['ordered-list-item', faListOl], ['blockquote', faQuoteLeft]];

export default function DraftEditor(props) {
    const editorRef = useRef(null);

    const markdown = useRef(markdownToDraft(props.value));
    markdown.current.blocks = markdown.current.blocks.map((b, i) => ({...b, key: `foo-${i}`}));
    const [editorState, setEditorState] = useState(EditorState.createWithContent(convertFromRaw(markdown.current)));

    function setFocus(e) {
        if (editorRef.current) {
            editorRef.current.focus();
        }
    }

    function toggleBlockType(blockType) {
        handleChange(RichUtils.toggleBlockType(editorState, blockType))
    }

    function toggleInlineStyle(style) {
        handleChange(RichUtils.toggleInlineStyle(editorState, style));
    }

    function handleChange(state) {
        setEditorState(state);
        props.handleChange(draftToMarkdown(convertToRaw(state.getCurrentContent())));
    }

    return <div>
        <div className={styles.controlBar}>
            {inlineStyleTypes.map(t => <InlineStyleButton editorState={editorState} handleToggle={toggleInlineStyle}
                                                          type={t[0]} icon={t[1]}/>)}
            {blockTypes.map(t => <BlockStyleButton editorState={editorState} handleToggle={toggleBlockType} type={t[0]}
                                                   icon={t[1]}/>)}
        </div>
        <div className={styles.editor} onClick={setFocus}>
            <Editor editorKey={"foobar"} editorState={editorState} onChange={handleChange} ref={editorRef}/>
        </div>
    </div>
}

DraftEditor.propTypes = {
    value: PropTypes.string.isRequired,
};
