import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./discountSection.module.scss";
import DiscountCodeModal from "./discountCodeModal"; // Import the modal

// Dummy data for discounts.
const dummyDiscounts = [
  {
    id: "01",
    code: "EARLYBIRD10",
    discount: "10%",
    status: "Active",
    discountPercentage: 10,
    maxDiscountAmount: 50,
    minDiscountAmount: 0,
    quantity: 100,
  },
  {
    id: "02",
    code: "SUMMER2025",
    discount: "$5.00",
    status: "Active",
    discountPercentage: 0,
    maxDiscountAmount: 5,
    minDiscountAmount: 0,
    quantity: 200,
  },
  {
    id: "03",
    code: "STUDENTPASS",
    discount: "15%",
    status: "Expired",
    discountPercentage: 15,
    maxDiscountAmount: 10,
    minDiscountAmount: 0,
    quantity: 50,
  },
];

/**
 * DiscountSection component - Displays and manages event discount codes.
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data
 * @returns {JSX.Element} DiscountSection component
 */
const DiscountSection = ({ eventData }) => {
  const [discounts, setDiscounts] = useState(dummyDiscounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  /**
   * Handle clicking the "Create New Discount" button
   */
  const handleCreateNew = () => {
    setEditingDiscount(null); // No data for a new discount
    setIsModalOpen(true);
  };

  /**
   * Handle clicking the edit button on a discount row
   * @param {Object} discount The discount to edit
   */
  const handleEditClick = (discount) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

  /**
   * Handle closing the modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
  };

  /**
   * Handle saving the discount from the modal
   * @param {Object} discountData The data from the modal form
   */
  const handleSaveDiscount = (discountData) => {
    if (editingDiscount) {
      // Logic to update an existing discount
      console.log("Updating discount:", discountData);
      // Here you would typically update the state:
      // setDiscounts(discounts.map(d => d.id === discountData.id ? discountData : d));
    } else {
      // Logic to create a new discount
      console.log("Creating new discount:", discountData);
      // Here you would typically add to the state:
      // setDiscounts([...discounts, { ...discountData, id: new Date().getTime() }]);
    }
    handleCloseModal(); // Close the modal after save
  };

  return (
    <>
      <div className={styles.discountSectionContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Discounts</h2>
          <button
            className={styles.createDiscountButton}
            onClick={handleCreateNew}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4.16669V15.8334"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.16602 10H15.8327"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Create New Discount
          </button>
        </div>

        <div className={styles.discountsList}>
          {/* Table Header */}
          <div className={`${styles.discountRow} ${styles.discountsHeader}`}>
            <div className={`${styles.discountCell} ${styles.cellId}`}>#</div>
            <div className={`${styles.discountCell} ${styles.cellCode}`}>
              Code
            </div>
            <div className={`${styles.discountCell} ${styles.cellDiscount}`}>
              Discount
            </div>
            <div className={`${styles.discountCell} ${styles.cellStatus}`}>
              Status
            </div>
            <div
              className={`${styles.discountCell} ${styles.cellActions}`}
            ></div>
          </div>

          {/* Table Body */}
          {discounts.map((discount) => (
            <div key={discount.id} className={styles.discountRow}>
              <div className={`${styles.discountCell} ${styles.cellId}`}>
                {discount.id}
              </div>
              <div className={`${styles.discountCell} ${styles.cellCode}`}>
                {discount.code}
              </div>
              <div className={`${styles.discountCell} ${styles.cellDiscount}`}>
                {discount.discount}
              </div>
              <div className={`${styles.discountCell} ${styles.cellStatus}`}>
                <span
                  className={`${styles.statusBadge} ${
                    styles[discount.status.toLowerCase()]
                  }`}
                >
                  {discount.status}
                </span>
              </div>
              <div className={`${styles.discountCell} ${styles.cellActions}`}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditClick(discount)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render the modal */}
      <DiscountCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDiscount}
        discountCode={editingDiscount || {}}
      />
    </>
  );
};

DiscountSection.propTypes = {
  eventData: PropTypes.object.isRequired,
};

export default DiscountSection;
