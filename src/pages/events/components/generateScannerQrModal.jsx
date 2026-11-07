import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { FiCheck, FiCopy, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import styles from "./eventHeaderNav.module.scss";

const PNG_SIZE = 1024; // Large enough to stay sharp on a printed sign.

const downloadFileName = (eventName) => {
  const slug = (eventName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "event"}-scanner-qr.png`;
};

const GenerateScannerQrModal = ({ isOpen, onClose, eventId, eventName }) => {
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

  const scannerUrl = `${window.location.origin}/scanner?event=${encodeURIComponent(eventId)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scannerUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy scanner link:", error);
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
        aria-labelledby="scanner-qr-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="scanner-qr-title">Scanner QR Code</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {eventName && <p className={styles.qrEventName}>{eventName}</p>}
          <div className={styles.qrFrame}>
            <QRCodeSVG
              value={scannerUrl}
              size={208}
              level="M"
              role="img"
              title={`QR code that opens the ticket scanner for ${eventName || "this event"}`}
            />
          </div>
          <QRCodeCanvas
            ref={pngCanvasRef}
            value={scannerUrl}
            size={PNG_SIZE}
            level="M"
            marginSize={4}
            style={{ display: "none" }}
          />
          <p className={styles.qrHelp}>
            Door staff scan this with their phone camera to open the ticket scanner for this
            event, then log in with their Scanner ID. It's safe to print, as the code doesn't
            log anyone in.
          </p>
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

GenerateScannerQrModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  eventName: PropTypes.string,
};

GenerateScannerQrModal.defaultProps = {
  eventId: null,
  eventName: "",
};

export default GenerateScannerQrModal;
