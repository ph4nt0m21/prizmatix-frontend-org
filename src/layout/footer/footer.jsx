import React from 'react';
import styles from './footer.module.scss';

/**
 * Footer component - Currently minimalistic as the design doesn't show a prominent footer
 * Can be expanded in the future if additional footer elements are needed
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.copyright}>
          © {currentYear} Ticket Booking App. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;