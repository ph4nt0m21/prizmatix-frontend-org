import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './anchoredDropdownPanel.module.scss';

const VIEWPORT_PADDING = 8;

/**
 * Renders a dropdown panel in a portal so it is not clipped by overflow containers.
 */
const AnchoredDropdownPanel = ({
  open,
  anchorEl,
  onClose,
  children,
  align = 'start',
}) => {
  const panelRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      return undefined;
    }

    const updatePosition = () => {
      const rect = anchorEl.getBoundingClientRect();
      const panelHeight = panelRef.current?.offsetHeight ?? 280;
      const gap = 6;

      let top = rect.bottom + gap;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (
        top + panelHeight > window.innerHeight - VIEWPORT_PADDING &&
        spaceAbove > spaceBelow
      ) {
        top = rect.top - panelHeight - gap;
      }

      top = Math.max(
        VIEWPORT_PADDING,
        Math.min(top, window.innerHeight - panelHeight - VIEWPORT_PADDING)
      );

      const width = rect.width;
      let left = align === 'end' ? rect.right - width : rect.left;
      left = Math.max(
        VIEWPORT_PADDING,
        Math.min(left, window.innerWidth - width - VIEWPORT_PADDING)
      );

      setCoords({ top, left, width });
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
        ref={panelRef}
        className={styles.panel}
        data-anchored-dropdown-panel
        style={{
          top: coords.top,
          left: coords.left,
          minWidth: coords.width,
        }}
        role="listbox"
      >
        {children}
      </div>
    </>,
    document.body
  );
};

AnchoredDropdownPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['start', 'end']),
};

export default AnchoredDropdownPanel;
