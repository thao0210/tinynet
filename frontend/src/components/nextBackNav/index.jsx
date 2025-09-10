import { useEffect, useRef, useCallback } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import styles from "./styles.module.scss";
import { CommentIcon, LikeIcon } from "../listComponents/icons";

const NextBackNav = ({ allIds, currentId, parentId, onNavigate, item, onCommentClick }) => {
  const showNav =
    allIds && allIds.length > 1 && allIds.indexOf(currentId) !== -1;

  const currentIndex = allIds?.indexOf(currentId) ?? -1;
  const prevId = showNav
    ? allIds[(currentIndex - 1 + allIds.length) % allIds.length]
    : null;
  const nextId = showNav
    ? allIds[(currentIndex + 1) % allIds.length]
    : null;

  const nextIdRef = useRef(nextId);
  const prevIdRef = useRef(prevId);

  useEffect(() => {
    if (showNav) {
      nextIdRef.current = nextId;
      prevIdRef.current = prevId;
    }
  }, [nextId, prevId, showNav]);

  const handleNavigate = useCallback(
    (id) => {
      if (!id) return;
      onNavigate(id, parentId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [onNavigate, parentId]
  );

  useEffect(() => {
    if (!showNav) return;

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
  }, [handleNavigate, showNav]);

  return (
    <div className={styles.navWrapper}>
      {showNav && (
        <>
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
        </>
      )}

      <LikeIcon item={item} />
      <CommentIcon
        noOfComments={item?.noOfComments || 0}
        onClick={onCommentClick}
      />
    </div>
  );
};

export default NextBackNav;
