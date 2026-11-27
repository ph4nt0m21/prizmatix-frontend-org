import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { FiCheck, FiCopy, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import { getPublicEventUrl } from "../../../utils/eventLinkUtil";
import styles from "./eventHeaderNav.module.scss";

const PNG_SIZE = 1024; // Large enough to stay sharp on a printed poster.

const downloadFileName = (eventName) => {
  const slug = (eventName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "event"}-qr-code.png`;
};

const EventLinkQrModal = ({ isOpen, onClose, eventId, eventSlug, eventName, isDraft }) => {
  const [isCopied, setIsCopied] = useState(false);
  const pngCanvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const eventUrl = getPublicEventUrl({ slug: eventSlug, id: eventId });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy event link:", error);
      toast.error("Couldn't copy the link. Please try again.");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pngCanvasRef.current.toDataURL("image/png");
    link.download = downloadFileName(eventName);
    link.click();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.qrModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-qr-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="event-qr-title">Event QR Code</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {eventName && <p className={styles.qrEventName}>{eventName}</p>}
          <div className={styles.qrFrame}>
            <QRCodeSVG
              value={eventUrl}
              size={208}
              level="M"
              role="img"
              title={`QR code that opens the ticket page for ${eventName || "this event"}`}
            />
          </div>
          <QRCodeCanvas
            ref={pngCanvasRef}
            value={eventUrl}
            size={PNG_SIZE}
            level="M"
            marginSize={4}
            style={{ display: "none" }}
          />
          <a className={styles.qrLink} href={eventUrl} target="_blank" rel="noopener noreferrer">
            {eventUrl}
          </a>
          <p className={styles.qrHelp}>
            Customers scan this to open your event page and buy tickets. Add it to posters, flyers
            or social posts.
          </p>
          {isDraft && (
            <p className={styles.qrDraftNote}>
              This event is still a draft. Publish it before sharing this code.
            </p>
          )}
        </div>

        <div className={`${styles.modalFooter} ${styles.qrActions}`}>
          <button type="button" className={styles.qrSecondaryAction} onClick={handleCopy}>
            {isCopied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            <span aria-live="polite">{isCopied ? "Copied!" : "Copy link"}</span>
          </button>
          <button
            type="button"
            className={styles.qrPrimaryAction}
            onClick={handleDownload}
            autoFocus
          >
            <FiDownload aria-hidden="true" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

EventLinkQrModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  eventSlug: PropTypes.string,
  eventName: PropTypes.string,
  isDraft: PropTypes.bool,
};

EventLinkQrModal.defaultProps = {
  eventId: null,
  eventSlug: null,
  eventName: "",
  isDraft: false,
};

export default EventLinkQrModal;
