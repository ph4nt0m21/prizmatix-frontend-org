import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { FiExternalLink, FiX } from 'react-icons/fi';
import { getEventImageHref, resolvePreviewSrc } from '../../utils/eventImageUtil';
import styles from './eventImagePreviewModal.module.scss';

const EventImagePreviewModal = ({
  bannerHref,
  thumbnailHref,
  initialView,
  onClose,
}) => {
  const [activeView, setActiveView] = useState(initialView);

  const bannerSrc = resolvePreviewSrc(bannerHref);
  const thumbnailSrc = resolvePreviewSrc(thumbnailHref);
  const activeSrc = activeView === 'banner' ? bannerSrc : thumbnailSrc;
  const activeHref =
    activeView === 'banner'
      ? getEventImageHref(bannerHref)
      : getEventImageHref(thumbnailHref);
  const activeAlt = activeView === 'banner' ? 'Event banner' : 'Event thumbnail';
  const hasBanner = Boolean(bannerSrc);
  const hasThumbnail = Boolean(thumbnailSrc);
  const showSwitcher = hasBanner && hasThumbnail;

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!activeSrc) return null;

  const imageNode = (
    <img src={activeSrc} alt={activeAlt} className={styles.previewImg} />
  );

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={activeAlt}
      onClick={onClose}
    >
      <button
        type="button"
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Close preview"
      >
        <FiX size={24} />
      </button>

      <div
        className={styles.frame}
        onClick={(event) => event.stopPropagation()}
      >
        {activeHref ? (
          <a
            href={activeHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.imageLink}
            aria-label={`Open ${activeAlt} in a new tab`}
          >
            {imageNode}
          </a>
        ) : (
          imageNode
        )}

        <div className={styles.actions}>
          {showSwitcher ? (
            <div className={styles.switcher} role="tablist" aria-label="Event images">
              {hasBanner ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeView === 'banner'}
                  className={`${styles.switchBtn} ${
                    activeView === 'banner' ? styles.active : ''
                  }`}
                  onClick={() => setActiveView('banner')}
                >
                  Banner
                </button>
              ) : null}
              {hasThumbnail ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeView === 'thumbnail'}
                  className={`${styles.switchBtn} ${
                    activeView === 'thumbnail' ? styles.active : ''
                  }`}
                  onClick={() => setActiveView('thumbnail')}
                >
                  Thumbnail
                </button>
              ) : null}
            </div>
          ) : null}

          {activeHref ? (
            <a
              href={activeHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openLink}
            >
              <FiExternalLink size={16} />
              Open full image
            </a>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

EventImagePreviewModal.propTypes = {
  bannerHref: PropTypes.string,
  thumbnailHref: PropTypes.string,
  initialView: PropTypes.oneOf(['banner', 'thumbnail']).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EventImagePreviewModal;
