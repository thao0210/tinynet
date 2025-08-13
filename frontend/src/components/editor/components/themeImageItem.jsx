import {MdClose} from 'react-icons/md';

const ThemeImageItem = ({ image, index, onRemove, onClick, onRepeatChange, onSizeChange, onSizeCustomChange, onPositionChange }) => {
  const repeatMap = {
    "repeat": "Both side",
    "repeat-x": "Horizontal",
    "repeat-y": "Vertical",
    "no-repeat": "No Repeat"
  };
  return (
    <div className="themeImageItem">
      <MdClose onClick={() => onRemove(index)} />
      <img onClick={onClick} src={image.url} />

      <div>
        <span>Repeat</span>
        <ul className="radioList">
          {["repeat", "repeat-x", "repeat-y", "no-repeat"].map(option => (
            <li key={option}
                className={image.repeat === option ? 'active' : undefined}
                onClick={() => onRepeatChange(option, index)}>
              {repeatMap[option]}
            </li>
          ))}
        </ul>

        <span>Size</span>
        <ul className="radioList">
          {["auto", "contain", "cover", "custom"].map(option => (
            <li key={option}
                className={image.size === option ? 'active' : undefined}
                onClick={() => onSizeChange(option, index)}>
              {option === "auto" ? "Real size" : option.charAt(0).toUpperCase() + option.slice(1)}
            </li>
          ))}
        </ul>
        {
          image.size === 'custom' &&
          <>
            <span>Custom Size</span>
            <input type="number"
                  onChange={(e) => onSizeCustomChange(e, index)}
                  value={parseInt(image.customSize) || ''} /> 
          </>
        }

        <span>Position</span>
        <div className="imagePosition">
          {[
            "left top", "center top", "right top",
            "left center", "center center", "right center",
            "left bottom", "center bottom", "right bottom"
          ].map(pos => (
            <span key={pos}
                  className={image.position === pos ? 'active' : undefined}
                  onClick={() => onPositionChange(pos, index)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThemeImageItem;
