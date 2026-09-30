import React from 'react';
import {
  FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink
} from 'react-icons/fa';
import styles from './toolbar.module.scss';

const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // If cancelled
    if (url === null) {
      return;
    }

    // If cleared
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Set link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={styles.toolbar}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.isActive : ''}>
        <FaBold />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.isActive : ''}>
        <FaItalic />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? styles.isActive : ''}>
        <FaUnderline />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.isActive : ''}>
        <FaListUl />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? styles.isActive : ''}>
        <FaListOl />
      </button>
      <button onClick={setLink} className={editor.isActive('link') ? styles.isActive : ''}>
        <FaLink />
      </button>
    </div>
  );
};

export default Toolbar;