import Tippy from "@tippyjs/react";
import styles from "../styles.module.scss";
import { SelectorIcon } from "@/components/radio";
import CardRecorder from "../../newItem/itemTypes/card/cardRecorder";

const RecorderOption = ({ selectedSource, setSelectedSource, recordings, onRecordingFinish, handleDeleteRecording }) => (
  <div className={styles.optionGroup}>
    <span onClick={() => setSelectedSource("recorder")} className={styles.selector}>
      <SelectorIcon selected={selectedSource === "recorder"} />
    </span>
    <div className={selectedSource !== "recorder" ? styles.disabled : ""}>
      <CardRecorder onFinish={onRecordingFinish} disabled={selectedSource !== "recorder"} />
      {recordings.length > 0 && (
        <div className={styles.recordingsList}>
          <label>Recordings:</label>
          <ul>
            {recordings.map((rec, idx) => (
              <li key={idx} className={styles.recordItem}>
                <audio controls src={URL.createObjectURL(rec)} />
                <Tippy content='Delete this recording'>
                  <button onClick={() => handleDeleteRecording(idx)}>❌</button>
                </Tippy>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

export default RecorderOption;