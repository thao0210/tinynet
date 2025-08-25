import { FaMusic } from "react-icons/fa"
import Dropdown from "@/components/dropdown"
import FileUploader from '@/components/fleUpload';
import classes from '../styles.module.scss';
import { useEffect, useRef, useState } from "react";
import Checkbox from '@/components/checkbox';

const AddMusic = ({ setData }) => {
  const [musicUrl, setMusicUrl] = useState('');
  const [isRandom, setIsRandom] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const audioRef = useRef(null);

  const baseUrl = import.meta.env.VITE_R2_BASE_URL;
  const musicArray = Array.from({ length: 34 }, (_, i) => ({
    label: `music ${i + 1}`,
    value: `${baseUrl}/music/m${i + 1}.mp3`,
  }));

  // random logic
  useEffect(() => {
    if (isRandom) {
      const random = musicArray[Math.floor(Math.random() * musicArray.length)];
      setMusicUrl(random.value);
      setPreviewUrl(random.value);
      setUploadedFile(null);
    }
  }, [isRandom]);

  const onMusicSelect = (url) => {
    setMusicUrl(url);
    setPreviewUrl(url);
    setUploadedFile(null);
  };

  const handleFileChange = (file) => {
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      const localUrl = URL.createObjectURL(file);
      setUploadedFile({ url: localUrl, file, extension });
      setPreviewUrl(localUrl);
      setMusicUrl(''); // bỏ chọn system music
      setIsRandom(false);
    }
  };

  const handleConfirm = () => {
    if (isRandom) {
      setData(prev => ({...prev, backgroundMusic: musicUrl }));
    } else if (uploadedFile) {
      setData(prev => ({...prev, backgroundMusic: uploadedFile.url, uploadedMusicFile: uploadedFile.file }));
    } else if (musicUrl) {
      setData(prev => ({...prev, backgroundMusic: musicUrl }));
    }
  };

  return (
    <Dropdown
      trigger={<span><FaMusic /></span>}
      dropdownContainerSelector='#editor'
      tippy={'Add Music'}
      stopPropagation
      width={320}
    >
      {({ onClose }) => (
      <div id="story-music" className={classes.music}>
        <Checkbox 
          label="Random music from the system"
          isChecked={isRandom}
          setIsChecked={(val) => {
            setIsRandom(val);
            if (!val) setMusicUrl('');
          }}
        />

        <label>Select from the system</label>
        <Dropdown
          curValue={musicUrl || 'None'}
          list={musicArray}
          onSelect={onMusicSelect}
          width={160}
          isSound
          dropdownContainerSelector="#story-music"
          stopPropagation
          disabled={isRandom}
        />
      <div className={classes.customUpload}>
        <label className={classes.label}>Or upload your own music:</label>
        <FileUploader
          type="sound"
          onFileSelect={handleFileChange}
          resetKey={!uploadedFile}
          disabled={isRandom}
        />
      </div>

      {previewUrl && (
        <div className={classes.preview}>
          <audio ref={audioRef} controls src={previewUrl} autoPlay />
        </div>
      )}

      <div className={classes.actions}>
        <button className={'btn'} onClick={() => {
          handleConfirm();
          onClose();
          }}>
          Use this music
        </button>
      </div>
    </div>
    )}
    </Dropdown>
  );
};

export default AddMusic;