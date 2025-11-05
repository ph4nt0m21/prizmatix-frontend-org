import React, { useState } from "react";
import styles from "./eventHeaderNav.module.scss";
import { CreateScannerUserAPI } from "../../../services/allApis";
import { toast } from "react-toastify";

const GenerateScannerIdModal = ({ isOpen, onClose, assignedEventId }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddUserClick = async () => {
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        assignedEventId: assignedEventId,
      };

      await CreateScannerUserAPI(payload);
      toast.success("Scanner user created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating scanner user:", error);
      toast.error(error.response?.data?.message || "Failed to create scanner user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Generate Scanner ID</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p>Enter details for the scanner operator:</p>

          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.formLabel}>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="First name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.formLabel}>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="Last name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="user@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="Enter a secure password"
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.addUserButton}
            onClick={handleAddUserClick}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateScannerIdModal;
