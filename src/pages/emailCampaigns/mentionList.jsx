import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import styles from './mentionList.module.scss'; // We will create this SCSS file

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.replace(/^@/, '') }); // ✅ removes the first @ only
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className={styles.items}>
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`${styles.item} ${index === selectedIndex ? styles.isSelected : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className={styles.item}>No results</div>
      )}
    </div>
  );
});

export default MentionList;