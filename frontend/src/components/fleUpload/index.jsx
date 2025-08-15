import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { FiUpload } from 'react-icons/fi';
import classNames from 'classnames';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPT_TYPES = {
  image: 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif',
  video: 'video/mp4,video/webm,video/ogg,video/*,.mp4,.webm,.ogv',
  audio: 'audio/*,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/flac,.mp3,.wav,.ogg,.flac',
  sound: 'audio/*,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/flac,.mp3,.wav,.ogg,.flac'
};

const FileUploader = ({ type = 'image', onFileSelect, resetKey, disabled, hidePreview }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFile = (file) => {
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 10MB. Large files or slow internet connection may cause upload issues.');
      return;
    }
    setFileName(file.name);
    onFileSelect(file);
    const objectUrl = URL.createObjectURL(file);

    if (['image', 'video', 'sound', 'audio'].includes(type)) {
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const renderPreview = () => {
    if (!previewUrl) return <p className={styles.previewText}>
      Click or drop {type} file here to upload <br /> 
      <small>(Max size: 10MB)</small><br />
      <small>Large files or slow internet connection may cause upload issues.</small>
      </p>;

    if (type === 'image' && !hidePreview) {
      return <img src={previewUrl} alt="preview" className={styles.previewImage} />;
    }

    if (type === 'video' && !hidePreview) {
      return <video src={previewUrl} className={styles.previewMedia} controls />;
    }

    if ((type === 'sound' || type === 'audio') && !hidePreview) {
      return <audio src={previewUrl} className={styles.previewMedia} controls />;
    }

    return <p className={styles.previewText}>{fileName}</p>;
  };

  useEffect(() => {
    if (resetKey) {
        setPreviewUrl(null);
        setFileName('');
        onFileSelect(null);
    }
  }, [resetKey]);
  return (
    <div
      className={classNames(styles.wrapper, {[styles.disabled] : disabled})}
      onClick={() => inputRef.current.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        accept={ACCEPT_TYPES[type] || ''}
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={handleFileChange}
      />
      {renderPreview()}
      {previewUrl && <div className={styles.hint}>Click or tap to change file</div>}
      {previewUrl && <FiUpload className={styles.uploadIcon} />}
    </div>
  );
};

export default FileUploader;
