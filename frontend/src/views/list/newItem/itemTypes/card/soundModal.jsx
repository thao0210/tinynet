import { useState } from 'react';
import CardRecorder from './cardRecorder';
import Dropdown from '@/components/dropdown';
import Modal from '@/components/modal';
import Accordion from '@/components/accordion';
import NATURAL_SOUNDS from '@/sharedConstants/naturalSounds';
import classes from './styles.module.scss';
import Checkbox from '@/components/checkbox';
import MEME_SOUNDS from '@/sharedConstants/memeSounds';
import FileUploader from '@/components/fleUpload';

const SoundModal = ({
  setShowSound,
  music,
  setMusic,
  recorder,
  setRecorder,
  naturalSounds,
  setNaturalSounds,
  uploadedFile,
  setUploadedFile
}) => {
  const baseUrl = import.meta.env.VITE_R2_BASE_URL;
  const musicArray = Array.from({ length: 34 }, (_, i) => ({
    label: `music ${i + 1}`,
    value: `${baseUrl}/music/m${i + 1}.mp3`,
  }));

  const onMusicSelect = (song) => {
    setUploadedFile(null); // clear custom music if selecting from system
    setMusic({ url: song, file: null });
  };

  const onSoundSelect = (sound) => {
    if (!naturalSounds.some(s => s.url === sound)) {
      setNaturalSounds(prev => [...prev, {
        url: sound,
        delay: 0,
        volume: 1,
        label: sound.split('/').pop(),
        type: 'sound'
      }]);
    }
  };

  const onRecordingFinish = (recordedBlob) => {
    const localUrl = URL.createObjectURL(recordedBlob);
    const extension = 'webm'; // default format for MediaRecorder
    setNaturalSounds(prev => [...prev, {
      url: localUrl,
      file: recordedBlob,
      format: extension,
      delay: 0,
      volume: 1,
      label: `voice-${prev.filter(s => s.file).length + 1}`,
      type: 'recorder'
    }]);
  };

  const updateSound = (index, key, value) => {
    const updated = [...naturalSounds];
    if (key === 'volume') {
      updated[index][key] = parseFloat(value);
    } else if (key === 'loop') {
      updated[index][key] = !!value; // đảm bảo là boolean
    } else {
      updated[index][key] = parseInt(value);
    }
    setNaturalSounds(updated);
  };

  const removeSound = (index) => {
    const updated = [...naturalSounds];
    updated.splice(index, 1);
    setNaturalSounds(updated);
  };

  const handleFileChange = (file) => {
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      const localUrl = URL.createObjectURL(file);
      setUploadedFile({ url: localUrl, file, extension });
      setMusic({ url: localUrl, file });
    }
  };

  return (
    <Modal width={600} onClose={() => setShowSound(null)}>
      <div className={classes.bgAndR} id='bgAndR'>
        <h2>Choose Sound</h2>
        <div className={classes.content}>

          <Accordion title="🔈 Natural Sounds - Memes and Recorder (multiple)">
            <div className={classes.item}>
              <label>Natural Sounds</label>
              <Dropdown
                curValue="Select ambient sound"
                list={NATURAL_SOUNDS}
                onSelect={onSoundSelect}
                dropdownContainerSelector="#bgAndR"
                width={150}
                isSound
                stopPropagation
              />
            </div>
            <div className={classes.item}>
              <label>Meme</label>
              <Dropdown
                curValue="Select meme sound"
                list={MEME_SOUNDS}
                onSelect={onSoundSelect}
                dropdownContainerSelector="#bgAndR"
                width={150}
                isSound
                stopPropagation
              />
            </div>
            
            <div className={classes.item}>
              <CardRecorder recorder={recorder} setRecorder={setRecorder} onFinish={onRecordingFinish} />
            </div>

            <div className={classes.soundList}>
              {naturalSounds.map((sound, idx) => (
                <div key={idx} className={classes.soundItem}>
                  <h4>{sound.label}</h4>
                  <audio controls src={sound.url} />
                  <div className={classes.item}>
                    <label>Delay (s):</label>
                    <input
                      type="number"
                      min={0}
                      value={sound.delay}
                      onChange={e => updateSound(idx, 'delay', e.target.value)}
                    />
                  </div>
                  <div className={classes.item}>
                    <label>Volume:</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={sound.volume}
                      onChange={e => updateSound(idx, 'volume', e.target.value)}
                    />
                  </div>
                  <Checkbox 
                    label={'Loop'} 
                    isChecked={sound.loop}
                    setIsChecked={(value) => updateSound(idx, 'loop', value)} 
                  />
                  <span onClick={() => removeSound(idx)}>✕</span>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="🎵 Background Music">
            <div className={classes.item}>
            <label>Select from the system</label>
            <Dropdown
              curValue={music?.url || 'None'}
              list={musicArray}
              onSelect={onMusicSelect}
              width={150}
              isSound
              dropdownContainerSelector="#bgAndR"
              stopPropagation
            />
            </div>
            <div className={classes.customUpload}>
              <label className={classes.label}>Or upload your own music:</label>
              <FileUploader type='sound' onFileSelect={handleFileChange} resetKey={!uploadedFile} />
            </div>
          </Accordion>

        </div>
      </div>
    </Modal>
  );
};

export default SoundModal;
