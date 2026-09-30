import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './anchoredActionMenu.module.scss';

const MENU_WIDTH = 128;
const VIEWPORT_PADDING = 8;

/**
 * Renders a dropdown action menu in a portal so it is not clipped by overflow containers.
 */
const AnchoredActionMenu = ({
  open,
  anchorEl,
  onClose,
  children,
  align = 'end',
}) => {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      return undefined;
    }

    const updatePosition = () => {
      const rect = anchorEl.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight ?? 96;
      const gap = 4;

      let top = rect.bottom + gap;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (
        top + menuHeight > window.innerHeight - VIEWPORT_PADDING &&
        spaceAbove > spaceBelow
      ) {
        top = rect.top - menuHeight - gap;
      }

      top = Math.max(
        VIEWPORT_PADDING,
        Math.min(top, window.innerHeight - menuHeight - VIEWPORT_PADDING)
      );

      let left =
        align === 'end' ? rect.right - MENU_WIDTH : rect.left;
      left = Math.max(
        VIEWPORT_PADDING,
        Math.min(left, window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING)
      );

      setCoords({ top, left });
    };

    updatePosition();
    const rafId = requestAnimationFrame(updatePosition);

    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [open, anchorEl, align, children]);

  if (!open || !anchorEl || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        onPointerDown={onClose}
        aria-hidden
      />
      <div
        ref={menuRef}
        className={styles.menu}
        style={{ top: coords.top, left: coords.left }}
        role="menu"
      >
        {children}
      </div>
    </>,
    document.body
  );
};

AnchoredActionMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['start', 'end']),
};

export { styles as anchoredActionMenuStyles };
export default AnchoredActionMenu;
