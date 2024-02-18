import React, { useEffect, useState } from 'react';
import { Editor, EditorState, RichUtils, Modifier, convertFromRaw, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './App.css';

function App() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    // Load saved content from localStorage
    const savedContent = localStorage.getItem('content');
    if (savedContent) {
      try {
        const content = JSON.parse(savedContent);
        const contentState = convertFromRaw(content);
        setEditorState(EditorState.createWithContent(contentState));
      } catch (e) {
        console.error('Error loading saved content: ', e);
      }
    }
  }, []);

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleBeforeInput = (chars) => {
    if (chars !== ' ' && chars !== '#' && chars !== '*' && chars !== '**' && chars !== '***') {
      return 'not-handled';
    }

    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const key = currentSelection.getStartKey();
    const text = currentContent.getBlockForKey(key).getText();
    const blockLength = text.length;
    let type = null;

    if (text === '#' && chars === ' ') {
      type = 'header-one';
    } else if (text === '*' && chars === ' ') {
      type = 'BOLD';
    } else if (text === '**' && chars === ' ') {
      type = 'red-line'; // Custom styleMap needed
    } else if (text === '***' && chars === ' ') {
      type = 'UNDERLINE';
    }

    if (type) {
      const newContentState = Modifier.removeRange(
        currentContent,
        currentSelection.merge({
          anchorOffset: 0,
          focusOffset: blockLength,
        }),
        'backward',
      );

      let newState = EditorState.push(editorState, newContentState, 'remove-range');
      newState = RichUtils.toggleInlineStyle(newState, type);
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  };

  const handleReturn = (e) => {
    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const currentBlockType = RichUtils.getCurrentBlockType(editorState);

    // Check if the current block type is not 'unstyled', then reset to normal paragraph on new line
    if (currentBlockType !== 'unstyled') {
      const newContentState = Modifier.setBlockType(currentContent, selectionState, 'unstyled');
      const newState = EditorState.push(editorState, newContentState, 'change-block-type');
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled'; // Let Draft.js handle the return
  };

  const styleMap = {
    'red-line': {
      color: 'red',
      fontSize: '16px',
      textDecoration: "none",
    },
    'header-one': {
      color: 'black',
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    'BOLD':{
      color: 'black',
      fontSize: '16px',
      fontWeight: 'bold',
    },
    'UNDERLINE':{
      color: 'black',
      fontWeight:'none',
      textDecoration: "underline",
      fontSize: '16px',
    }
    
  };
  

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem('content', JSON.stringify(rawContent));
  };

  return (
    <div className="App">
    <div className='main'>
    <div>
      <h2 className='head'>Demo Editor by Adishyam</h2>
      </div>
      <div>
        <button onClick={saveContent} className='head-button'>Save</button>
      </div>
    </div>
      <div className='editor'>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        handleKeyCommand={handleKeyCommand}
        handleBeforeInput={handleBeforeInput}
        handleReturn={handleReturn}
        customStyleMap={styleMap}
      />
      </div>
    </div>
  );
}

export default App;
