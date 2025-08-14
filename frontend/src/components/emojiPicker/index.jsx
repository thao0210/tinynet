// components/EmojiPickerLite.jsx
import React, { useState } from "react";
import styles from "./styles.module.scss";

/**
 * @param {Object} props
 * @param {Function} props.onSelect - callback khi chọn emoji
 * @param {string} [props.buttonLabel="😀"] - emoji mặc định trên nút
 * @param {Array<string>} [props.emojis] - danh sách emoji
 */
export default function EmojiPickerLite({
  onSelect,
  emojis = [
  "😂","❤️","😍","🤣","😊","🙏","💕","😭","😘","👍",
  "😅","👏","😁","♥️","🔥","💔","💖","💙","😢","🤔",
  "😆","🙄","💪","😉","☺️","👌","🤗","💜","😔","😎",
  "😇","🌹","🤦","🎉","‼️","💞","✌️","✨","🤷","😱",
  "😌","🌸","🙌","😋","💗","💚","😏","💛","🙂","💓",
  "🤩","😄","😀","🖤","😃","💯","🙈","👇","🎶","😒",
  "🤭","❣️","❗","😜","💋","👀","😪","😑","💥","🙋",
  "😞","😩","😡","🤪","👊","☀️","😥","🤤","👉","💃",
  "😳","✋","😚","😝","😴","🌟","😬","🙃","🍀","🌷",
  "😻","😓","⭐","✅","🌈","😈","🤘","💦","✔️","😣",
  "🏃","💐","☹️","🎊","💘","😠","☝️","😕","🌺","🎂"
],
  className = "",
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji) => {
    if (onSelect) onSelect(emoji);
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
        <div className={styles.picker}>
          {emojis.map((emoji, idx) => (
            <span
              key={idx}
              className={styles.emojiBtn}
              onClick={() => handleSelect(emoji)}
            >
              {emoji}
            </span>
          ))}
        </div>
    </div>
  );
}
