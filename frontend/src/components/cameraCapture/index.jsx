import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';
import classes from './styles.module.scss';
import { FaMicrophone, FaMicrophoneSlash, FaRegImage, FaVideo } from "react-icons/fa6";
import Tippy from '@tippyjs/react';
import { RiCameraSwitchFill } from "react-icons/ri";
import classNames from 'classnames';
import { FaCheckCircle, FaRedo } from 'react-icons/fa';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';

const CameraCapture = ({ onCapture, type, setType }) => {
  const videoRef = useRef(null);
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const videoChunksRef = useRef([]);

  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [mode, setMode] = useState(type || 'image'); // 'photo' or 'video'
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedVideoUrl, setCapturedVideoUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [useAudio, setUseAudio] = useState(false);

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // 🔄 Get device list & fallback to facingMode
  useEffect(() => {
    const init = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setDevices(videoInputs);

        if (videoInputs.length) {
          setDeviceId(videoInputs[0].deviceId);
        } else {
          // fallback
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: useAudio,
          });
          mediaStream.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;

          const videoTrack = stream.getVideoTracks()[0];
          const settings = videoTrack.getSettings();
          if (settings.deviceId) setDeviceId(settings.deviceId);
        }
      } catch (err) {
        console.error('Init camera error:', err);
        alert('Camera initialization failed: ' + err.message);
      }
    };

    init();
  }, []);

  // 📷 Start camera stream
  useEffect(() => {
    if (!deviceId) return;

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId }, audio: useAudio });
        stopStream();
        mediaStream.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Camera error', err);
        alert('Camera access failed: ' + err.message);
      }
    };

    startStream();

    return () => stopStream();
  }, [deviceId, useAudio]);

  const stopStream = () => {
    mediaStream.current?.getTracks().forEach(track => track.stop());
    mediaStream.current = null;
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedPhoto(canvas.toDataURL('image/png'));
    stopStream();
  };

  const handleStartRecording = () => {
    if (!mediaStream.current) return;

    videoChunksRef.current = [];

    const recorder = new MediaRecorder(mediaStream.current);
    mediaRecorder.current = recorder;

    recorder.ondataavailable = e => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setCapturedVideoUrl(url);
      stopStream();
    };

    recorder.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const handleUsePhoto = async () => {
    const croppedImage = await getCroppedImg(capturedPhoto, croppedAreaPixels);
    onCapture({ type: 'image', file: croppedImage });
    setCapturedPhoto(null);
    stopStream();
  };

  const handleUseVideo = () => {
    fetch(capturedVideoUrl)
      .then(res => res.blob())
      .then(blob => {
        onCapture({ type: 'video', file: blob });
        setCapturedVideoUrl(null);
        stopStream();
      });
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCapturedVideoUrl(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });

    setTimeout(() => {
      if (deviceId) {
        navigator.mediaDevices.getUserMedia({ video: { deviceId }, audio: useAudio })
          .then(stream => {
            mediaStream.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
          });
      }
    }, 300);
  };

  const handleSwitchCamera = () => {
    if (!devices.length) return;
    const currentIndex = devices.findIndex(d => d.deviceId === deviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setDeviceId(devices[nextIndex].deviceId);
  };

  useEffect(()=>{
    mode === ''
  }, [mode]);

  return (
    <div className={classes.cameraWrapper} id='cameraWrapper'>
      {!capturedPhoto && !capturedVideoUrl && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={classes.video}
          />
          {devices.length > 0 && (
              <Tippy content='Camera Switch'>
                <span onClick={handleSwitchCamera} className={classes.switchCamera}>
                  <RiCameraSwitchFill size={30} />
                </span>
              </Tippy>
            )}
          <div className={classes.modeSwitch}>
              <Tippy content='Photo'>
                <span onClick={() => {
                  setMode('image');
                  setType?.('image');
                  }} className={mode === 'image' ? classes.active : ''}><FaRegImage size={28} /></span>
              </Tippy>
              <Tippy content='Video'>
                <span onClick={() => {
                  setMode('video');
                  setType?.('video');
                }} className={mode === 'video' ? classes.active : ''}><FaVideo  size={32}/></span>
              </Tippy>
            </div>
          <div className={classes.controls}>
            {(mode === 'image' || mode === 'video') && (
              <Tippy content={mode === 'image' ? 'Take Photo' : (recording ? 'Stop Recording' : 'Start Recording')}>
                <div
                  className={classNames(classes.recordButton, {[classes.recording]: recording})}
                  onClick={() => {
                    if (mode === 'image') handleTakePhoto();
                    else if (mode === 'video' && !recording) handleStartRecording();
                    else if (mode === 'video' && recording) handleStopRecording();
                  }}
                />
              </Tippy>
            )}
            {
              mode === 'video' &&
              <Tippy content="Micro">
                  <span onClick={() => setUseAudio(!useAudio)}>
                      {
                          !useAudio ? <FaMicrophoneSlash /> : <FaMicrophone />
                      }
                  </span>
              </Tippy>
            }
          </div>
        </>
      )}

      {capturedPhoto && (
        <div className={classes.cropContainer}>
          <Cropper
            image={capturedPhoto}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
          />
          <div className={classes.zoomControl}>
             <span className={classes.zoomValue}>{zoom.toFixed(1)}x</span>
            <Tippy content="Zoom Out">
              <span
                className={classes.zoomBtn}
                onClick={() => setZoom(prev => Math.max(1, +(prev - 0.1).toFixed(1)))}
              >
                <FiZoomOut size={30}/>
              </span>
            </Tippy>
            <Tippy content="Zoom In">
              <span
                className={classes.zoomBtn}
                onClick={() => setZoom(prev => Math.min(3, +(prev + 0.1).toFixed(1)))}
              >
                <FiZoomIn size={30} />
              </span>
            </Tippy>
          </div>
          <div className={classes.actions}>
            <button className="btn" onClick={handleUsePhoto}><FaCheckCircle size={20}/> Use This Photo</button>
            <button onClick={handleRetake} className='btn sub'><FaRedo /> Retake</button>
          </div>
        </div>
      )}

      {capturedVideoUrl && (
        <div className={classes.preview}>
          <video src={capturedVideoUrl} controls className={classes.videoPreview} />
          <div className={classes.actions}>
            <button className="btn" onClick={handleUseVideo}><FaCheckCircle size={20} /> Use This Video</button>
            <button onClick={handleRetake} className='btn sub'><FaRedo /> Retake</button>
          </div>
        </div>
      )}
    </div>

  );
};

export default CameraCapture;
