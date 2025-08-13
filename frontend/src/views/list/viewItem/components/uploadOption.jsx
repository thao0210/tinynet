// components/UploadOption.jsx
import FileUploader from "@/components/fleUpload";
import styles from "../styles.module.scss";
import { SelectorIcon } from "@/components/radio";

const UploadOption = ({ selectedSource, setSelectedSource, uploadedFile, handleFileChange }) => (
  <div className={styles.optionGroup}>
    <span onClick={() => setSelectedSource("file")} className={styles.selector}>
      <SelectorIcon selected={selectedSource === "file"} />
    </span>
    <div className={selectedSource !== "file" ? styles.disabled : ""}>
      <label>Upload voice file</label>
      <FileUploader type="sound" onFileSelect={handleFileChange} resetKey={!uploadedFile} />
      {uploadedFile && <p className={styles.fileName}>{uploadedFile.name}</p>}
    </div>
  </div>
);

export default UploadOption;