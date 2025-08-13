import { useRef, useState } from 'react';
import classes from './styles.module.scss';

const CardRecorder = ({ setRecorder, onFinish }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunksRef = useRef([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorderInstance = new MediaRecorder(stream);

      recorderInstance.ondataavailable = (e) => chunksRef.current.push(e.data);

      recorderInstance.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecorder?.(blob);
        onFinish?.(blob); // gọi callback onFinish nếu có
        chunksRef.current = [];
      };

      recorderInstance.start();
      setMediaRecorder(recorderInstance);
      setIsRecording(true);
    } catch (err) {
      alert('Microphone permission denied or not available.');
    }
  };

  const handleStopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  return (
    <div className={classes.recorderWrapper}>
      <label>Record your voice</label>
      <div className={classes.recorderBox}>
        {isRecording ? (
          <div onClick={handleStopRecording} className={classes.stopBtn}>■</div>
        ) : (
          <div onClick={handleStartRecording} className={classes.recordBtn}>●</div>
        )}
      </div>
    </div>
  );
};

export default CardRecorder;
