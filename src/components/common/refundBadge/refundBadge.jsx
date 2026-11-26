import React from 'react';
import styles from './refundBadge.module.scss';

/** @param {{refund: {label: string, tone: string}|null, detail?: string}} props */
const RefundBadge = ({ refund, detail }) => {
  if (!refund) return null;
  return (
    <span className={`${styles.badge} ${styles[refund.tone] || ''}`}>
      {refund.label}
      {detail ? ` ${detail}` : ''}
    </span>
  );
};

export default RefundBadge;
