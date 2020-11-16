import React, { useState } from 'react';
import PropTypes from 'prop-types';
import css from './style.css';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

function PlaintextEditor({ file, write }) {
  const { textVal } = file
  const [text, setText] = useState(textVal)

  const handleChange = (e) => {
    setText(e.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    file.textVal = text
    write(file)
  }

  return (
    <div className={css.editor}>
      <h3>Plain Text Editor</h3>
      <Form onSubmit={handleSubmit} style={{ width: '65%' }}>
        <Form.Control
          as="textarea"
          rows={20}
          style={{ width: '100%' }}
          onChange={handleChange}
          value={text}
          placeholder='Start typing...'
        />
        <Button type="submit" variant="warning">Save</Button>
      </Form>
    </div>
  );
}

PlaintextEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

export default PlaintextEditor;
