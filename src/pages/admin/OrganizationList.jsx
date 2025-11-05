import React from "react";
import styles from './organizationList.module.scss';

export default function OrganizationList({ onSelectOrg }) {
  const org = { id: 6, name: "Default Organization", created_at: "2025-01-01" };

  return (
    <div>
      <h2>Organizations</h2>
      <div onClick={() => onSelectOrg(org.id)} className={styles.orgCard}>
        <h3>{org.name}</h3>
        <p>Created: {new Date(org.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}