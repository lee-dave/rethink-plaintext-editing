import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import path from 'path';
import classNames from 'classnames';

import { listFiles } from '../files';

// Used below, these need to be registered
import MarkdownEditor from '../MarkdownEditor';
import PlaintextEditor from '../components/PlaintextEditor';

import IconPlaintextSVG from '../public/icon-plaintext.svg';
import IconMarkdownSVG from '../public/icon-markdown.svg';
import IconJavaScriptSVG from '../public/icon-javascript.svg';
import IconJSONSVG from '../public/icon-json.svg';

import css from './style.module.css';

const TYPE_TO_ICON = {
  'text/plain': IconPlaintextSVG,
  'text/markdown': IconMarkdownSVG,
  'text/javascript': IconJavaScriptSVG,
  'application/json': IconJSONSVG
};

function FilesTable({ files, activeFile, setActiveFile }) {
  return (
    <div className={css.files}>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr
              key={file.name}
              className={classNames(
                css.row,
                activeFile && activeFile.name === file.name ? css.active : ''
              )}
              onClick={() => setActiveFile(file)}
            >
              <td className={css.file}>
                <div
                  className={css.icon}
                  dangerouslySetInnerHTML={{
                    __html: TYPE_TO_ICON[file.type]
                  }}
                ></div>
                {path.basename(file.name)}
              </td>

              <td>
                {new Date(file.lastModified).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

FilesTable.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  activeFile: PropTypes.object,
  setActiveFile: PropTypes.func
};

function Previewer({ file }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    (async () => {
      setValue(await file.text());
    })();
  }, [file]);

  let elementsArray = []
  if (file.type === 'text/javascript') {
    const bracketTypes = '{|}'
    const variableTypes = 'var|let|const|=>'
    const importTypes = 'import|export'
    const returnTypes = 'return|default|from'
    const hooksRegex = 'useState|useRef|useEffect'
    let commentBool = false

    elementsArray = value.split(' ').map((word, idx) => {
      if (word.includes('//')) {
        const commentIndex = word.indexOf('//')
        commentBool = true
        if (word.includes('https')) {
          let lastForwardSlash = 0
          for (let i = word.length; i >= 0; i--) {
            if (word[i] === '/') {
              lastForwardSlash = i
              break
            }
          }
          commentBool = false
          return [<span key={idx} className={css.commentStyle}>{word.slice(0, lastForwardSlash + 1)}</span>, word.slice(lastForwardSlash + 1), ' ']
        }
        return [word.slice(0, commentIndex), <span key={idx} className={css.commentStyle}>// </span>]
      }
      if (commentBool) {
        return <span key={idx} className={css.commentStyle}>{word + ' '}</span>
      }
      if (new RegExp(variableTypes).test(word)) {
        return <span key={idx} className={css.variableStyle}>{word + ' '}</span>
      }
      if (new RegExp(importTypes).test(word)) {
        return <span key={idx} className={css.importStyle}>{word + ' '}</span>
      }
      if (new RegExp(returnTypes).test(word)) {
        return <span key={idx} className={css.returnStyle}>{word + ' '}</span>
      }
      if (new RegExp(hooksRegex).test(word)) {
        const useStateIndex = word.indexOf('useState')
        const useRefIndex = word.indexOf('useRef')
        const useEffectIndex = word.indexOf('useEffect')
        if (useStateIndex >= 0) return [<span key={idx} className={css.hooksStyle}>useState</span>, word.slice(useStateIndex + 8), ' ']
        if (useRefIndex >= 0) return [<span key={idx} className={css.hooksStyle}>useRef</span>, word.slice(useStateIndex + 7), ' ']
        if (useEffectIndex >= 0) return [<span key={idx} className={css.hooksStyle}>useEffect</span>, word.slice(useStateIndex + 10), ' ']
      }
      if (new RegExp(bracketTypes).test(word)) {
        const leftBracketIndex = word.indexOf('{')
        const rightBracketIndex = word.indexOf('}')
        if (leftBracketIndex >= 0) return [word.slice(0, leftBracketIndex), <span key={idx} className={css.hooksStyle}>{'{'}</span>, word.slice(leftBracketIndex + 1), ' ']
        if (rightBracketIndex >= 0) return [word.slice(0, rightBracketIndex), <span key={idx} className={css.hooksStyle}>{'}'}</span>, word.slice(rightBracketIndex + 1), ' ']
      }
      else {
        return word + ' '
      }
    })
  }

  // did account for numbers
  let jsonDisplay = []
  if (file.type === 'application/json') {
    const splitJson = value.split(' ')
    let isBeforeColon = true
    let isInArray = false

    for (let ele of splitJson) {
      if (ele === ':') {
        isBeforeColon = false
        jsonDisplay.push(': ')
        continue
      }
      if (isBeforeColon) {
        if (ele.includes(`"`)) {
          jsonDisplay.push(ele.slice(1, ele.length - 1))
          continue
        }
        jsonDisplay.push(ele)
        continue
      }
      if (!isBeforeColon) {
        if (ele === '[') isInArray = true
        if (ele === ']') isInArray = false
        if (isInArray) {
          if (ele.includes(',')) {
            jsonDisplay.push([<span className={css.jsonString}>{ele.slice(0, ele.length - 1)}</span>, ','])
            continue
          } else {
            if (ele.includes(`"`)) jsonDisplay.push([<span className={css.jsonString}>{ele}</span>])
            else jsonDisplay.push(ele)
          }
        }
        if (!isInArray) {
          if (ele.includes(',')) {
            const idx = ele.indexOf(',')
            if (ele.includes('.com')) {
              jsonDisplay.push([<a href={ele.slice(0, idx)} className={css.jsonURL}>{ele.slice(0, idx)}</a>, ele.slice(idx)])
            } else {
              jsonDisplay.push([<span className={css.jsonString}>{ele.slice(0, idx)}</span>, ele.slice(idx)])
            }
            isBeforeColon = true
            continue
          }
          jsonDisplay.push(ele)
        }
      }
    }
  }

  return (
    <div className={css.preview}>
      <div className={css.title}>{path.basename(file.name)}</div>
      <div className={css.content}>
        {elementsArray}
        {jsonDisplay}
      </div>
    </div>
  );
}

Previewer.propTypes = {
  file: PropTypes.object
};

// Uncomment keys to register editors for media types
const REGISTERED_EDITORS = {
  "text/plain": PlaintextEditor,
  "text/markdown": MarkdownEditor,
};

function PlaintextFilesChallenge() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    const files = listFiles();
    setFiles(files);
  }, []);

  const write = file => {
    console.log(file)
    setFiles(oldFiles => {
      return oldFiles.map(oldFile => {
        if (oldFile.name === file.name) return file
        else return oldFile
      })
    })
  };

  const Editor = activeFile ? REGISTERED_EDITORS[activeFile.type] : null;

  return (
    <div className={css.page}>
      <Head>
        <title>Rethink Engineering Challenge</title>
      </Head>
      <aside>
        <header>
          <div className={css.tagline}>Rethink Engineering Challenge</div>
          <h1>Fun With Plaintext</h1>
          <div className={css.description}>
            Let{"'"}s explore files in JavaScript. What could be more fun than
            rendering and editing plaintext? Not much, as it turns out.
          </div>
        </header>

        <FilesTable
          files={files}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
        />

        <div style={{ flex: 1 }}></div>

        <footer>
          <div className={css.link}>
            <a href="https://v3.rethink.software/jobs">Rethink Software</a>
            &nbsp;—&nbsp;Frontend Engineering Challenge
          </div>
          <div className={css.link}>
            Questions? Feedback? Email us at jobs@rethink.software
          </div>
        </footer>
      </aside>

      <main className={css.editorWindow}>
        {activeFile && (
          <>
            {Editor && <Editor file={activeFile} write={write} />}
            {!Editor && <Previewer file={activeFile} />}
          </>
        )}

        {!activeFile && (
          <div className={css.empty}>Select a file to view or edit</div>
        )}
      </main>
    </div>
  );
}

export default PlaintextFilesChallenge;
