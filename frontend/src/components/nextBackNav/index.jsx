import { useEffect, useRef, useCallback } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import styles from "./styles.module.scss";

const NextBackNav = ({ allIds, currentId, parentId, onNavigate }) => {
  if (!allIds || allIds.length === 0) return null;

  const currentIndex = allIds.indexOf(currentId);
  if (currentIndex === -1) return null;

  const prevId = allIds[(currentIndex - 1 + allIds.length) % allIds.length];
  const nextId = allIds[(currentIndex + 1) % allIds.length];

  const nextIdRef = useRef(nextId);
  const prevIdRef = useRef(prevId);

  // cập nhật ref mỗi khi nextId/prevId thay đổi
  useEffect(() => {
    nextIdRef.current = nextId;
    prevIdRef.current = prevId;
  }, [nextId, prevId]);

  const handleNavigate = useCallback(
    (id) => {
      onNavigate(id, parentId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [onNavigate, parentId]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNavigate(nextIdRef.current);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handleNavigate(prevIdRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNavigate]); // chỉ phụ thuộc handleNavigate ổn định

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
