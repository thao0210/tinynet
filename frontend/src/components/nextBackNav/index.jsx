import React from "react";
import styles from "./styles.module.scss";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const NextBackNav = ({ allIds, currentId, parentId, onNavigate }) => {
  if (!allIds || allIds.length === 0) return null;

  const currentIndex = allIds.indexOf(currentId);
  if (currentIndex === -1) return null;

  const prevId = allIds[(currentIndex - 1 + allIds.length) % allIds.length];
  const nextId = allIds[(currentIndex + 1) % allIds.length];

  const handleNavigate = (id) => {
    onNavigate(id, parentId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.navWrapper}>
      <span
        className={styles.navBtn}
        onClick={() => handleNavigate(prevId)}
        aria-label="Previous"
      >
        <FaChevronUp size={14} />
      </span>
      <span
        className={styles.navBtn}
        onClick={() => handleNavigate(nextId)}
        aria-label="Next"
      >
        <FaChevronDown size={14} />
      </span>
    </div>
  );
};


export default NextBackNav;
