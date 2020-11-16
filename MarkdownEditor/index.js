import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form'
import ReactMarkdown from 'react-markdown'

import css from './style.css';

function MarkdownEditor({ file, write }) {
  // console.log(file, write);
  const { textVal } = file
  const [text, setText] = useState(textVal)

  const handleChange = (e) => {
    const str = e.target.value
    setText(str)
    file.textVal = str
    write(file)
  }

  return (
    <div className={css.editor}>
      <h3>Markdown Editor</h3>
      <Form style={{ width: '65%', height: '100%' }}>
        <Form.Control
          as="textarea"
          rows={20}
          onChange={handleChange}
          value={text}
          placeholder='Start typing...'
          className={css.formMarkdown}
        >
        </Form.Control>
        <ReactMarkdown source={text} className={css.divMarkdown} />
      </Form>
    </div>
  );
}

MarkdownEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

export default MarkdownEditor;
