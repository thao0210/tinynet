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

const isSecureOrigin = () => {
  const hn = window.location.hostname;
  return window.isSecureContext || hn === 'localhost' || hn === '127.0.0.1' || hn === '::1';
};

const CameraCapture = ({ onCapture, type, setType }) => {
  const videoRef = useRef(null);
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const videoChunksRef = useRef([]);

  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [mode, setMode] = useState(type || 'image');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedVideoUrl, setCapturedVideoUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [useAudio, setUseAudio] = useState(false);

  // Camera state & errors
  const [cameraOn, setCameraOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const stopStream = () => {
    try {
      mediaStream.current?.getTracks().forEach(track => track.stop());
    } catch {}
    mediaStream.current = null;
  };

  const attachVideo = (stream) => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    // Đảm bảo phát (đặc biệt trên iOS/Android)
    const play = () => {
      videoRef.current?.play().catch(() => {});
    };
    if (videoRef.current.readyState >= 2) play();
    else videoRef.current.onloadedmetadata = play;
  };

  const listVideoInputs = async () => {
    const all = await navigator.mediaDevices.enumerateDevices();
    const vids = all.filter(d => d.kind === 'videoinput');
    setDevices(vids);
    return vids;
  };

  const getConstraints = (targetDeviceId) => {
    // Ưu tiên deviceId exact, fallback facingMode nếu lỗi
    return {
      video: targetDeviceId
        ? { deviceId: { exact: targetDeviceId } }
        : { facingMode: 'user' },
      audio: useAudio
    };
  };

  const startStream = async (targetDeviceId = null) => {
    setErrorMsg('');
    // Bảo vệ: chỉ chạy trên HTTPS/localhost
    if (!isSecureOrigin()) {
      setErrorMsg('Camera chỉ hoạt động trên HTTPS hoặc localhost.');
      return;
    }
    try {
      // 1) Lấy stream
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(getConstraints(targetDeviceId));
      } catch (e) {
        // Fallback nếu exact deviceId không thỏa (OverconstrainedError)
        if (targetDeviceId && e && e.name === 'OverconstrainedError') {
          stream = await navigator.mediaDevices.getUserMedia(getConstraints(null));
        } else {
          throw e;
        }
      }

      // Dừng stream cũ trước khi gán stream mới
      stopStream();
      mediaStream.current = stream;
      attachVideo(stream);

      // 2) Sau khi có quyền, enumerateDevices (mới đầy đủ)
      const vids = await listVideoInputs();
      // Nếu chưa có deviceId thì gán cái đầu tiên
      if (!targetDeviceId) {
        const track = stream.getVideoTracks()[0];
        const s = track.getSettings();
        const effectiveId = s.deviceId || (vids[0]?.deviceId ?? null);
        if (effectiveId) setDeviceId(effectiveId);
      }

      setCameraOn(true);
    } catch (err) {
      console.error('Camera init error:', err);
      const msg = err?.message || String(err);
      if (err?.name === 'NotAllowedError') setErrorMsg('Bạn đã từ chối quyền camera.');
      else if (err?.name === 'NotFoundError') setErrorMsg('Không tìm thấy camera.');
      else if (err?.name === 'NotReadableError') setErrorMsg('Không thể truy cập camera (đang bị ứng dụng khác sử dụng?).');
      else setErrorMsg('Không thể khởi tạo camera: ' + msg);
      setCameraOn(false);
      stopStream();
    }
  };

  // Restart stream khi đổi device hoặc bật/tắt mic (chỉ khi camera đang bật)
  useEffect(() => {
    if (!cameraOn) return;
    // Nếu chưa có deviceId (lần đầu), dùng null → facingMode
    startStream(deviceId || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, useAudio, cameraOn]);

  // Theo dõi thay đổi thiết bị (cắm/rút webcam)
  useEffect(() => {
    const onDeviceChange = async () => {
      if (!cameraOn) return;
      await listVideoInputs();
    };
    navigator.mediaDevices?.addEventListener?.('devicechange', onDeviceChange);
    return () => navigator.mediaDevices?.removeEventListener?.('devicechange', onDeviceChange);
  }, [cameraOn]);

  const handleTakePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 0;
    canvas.height = video.videoHeight || 0;
    if (!canvas.width || !canvas.height) {
      setErrorMsg('Không thể chụp ảnh: video chưa sẵn sàng.');
      return;
    }
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    setCapturedPhoto(canvas.toDataURL('image/png'));
    stopStream();
  };

  const handleStartRecording = () => {
    if (!mediaStream.current) return;
    try {
      videoChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(mediaStream.current, { mimeType: mime });
      mediaRecorder.current = recorder;

      recorder.ondataavailable = e => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setCapturedVideoUrl(url);
        stopStream();
      };
      recorder.start();
      setRecording(true);
    } catch (e) {
      console.error('MediaRecorder error', e);
      setErrorMsg('Thiết bị/trình duyệt không hỗ trợ quay video.');
    }
  };

  const handleStopRecording = () => {
    try { mediaRecorder.current?.stop(); } catch {}
    setRecording(false);
  };

  const handleUsePhoto = async () => {
    const croppedImage = await getCroppedImg(capturedPhoto, croppedAreaPixels);
    onCapture?.({ type: 'image', file: croppedImage });
    setCapturedPhoto(null);
    // không tự bật lại camera ở đây
  };

  const handleUseVideo = () => {
    fetch(capturedVideoUrl)
      .then(res => res.blob())
      .then(blob => {
        onCapture?.({ type: 'video', file: blob });
        setCapturedVideoUrl(null);
      });
  };

  const handleRetake = async () => {
    setCapturedPhoto(null);
    setCapturedVideoUrl(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    // bật lại camera với device hiện tại
    setCameraOn(true);
    await startStream(deviceId || null);
  };

  const handleSwitchCamera = async () => {
    if (!devices.length) return;
    const currentIndex = devices.findIndex(d => d.deviceId === deviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setDeviceId(devices[nextIndex].deviceId);
    // startStream sẽ tự chạy do effect [deviceId, useAudio, cameraOn]
  };

  return (
    <div className={classes.cameraWrapper} id='cameraWrapper'>
      {/* Nút bật camera (user gesture) */}
      {!cameraOn && !capturedPhoto && !capturedVideoUrl && (
        <div className={classes.enableWrap}>
          <button className="btn" onClick={() => startStream(deviceId || null)}>
            Turn on Camera
          </button>
          {!isSecureOrigin() && (
            <p className={classes.notice}>
              Bạn đang truy cập qua kết nối không bảo mật. Hãy dùng HTTPS hoặc localhost.
            </p>
          )}
          {errorMsg && <p className={classes.error}>{errorMsg}</p>}
        </div>
      )}

      {/* Live camera */}
      {cameraOn && !capturedPhoto && !capturedVideoUrl && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={classes.video}
          />
          {devices.length > 1 && (
            <Tippy content='Camera Switch'>
              <span onClick={handleSwitchCamera} className={classes.switchCamera}>
                <RiCameraSwitchFill size={30} />
              </span>
            </Tippy>
          )}

          <div className={classes.modeSwitch}>
            <Tippy content='Photo'>
              <span
                onClick={() => { setMode('image'); setType?.('image'); }}
                className={mode === 'image' ? classes.active : ''}
              >
                <FaRegImage size={28} />
              </span>
            </Tippy>
            <Tippy content='Video'>
              <span
                onClick={() => { setMode('video'); setType?.('video'); }}
                className={mode === 'video' ? classes.active : ''}
              >
                <FaVideo size={32}/>
              </span>
            </Tippy>
          </div>

          <div className={classes.controls}>
            {(mode === 'image' || mode === 'video') && (
              <Tippy content={mode === 'image' ? 'Take Photo' : (recording ? 'Stop Recording' : 'Start Recording')}>
                <div
                  className={classNames(classes.recordButton, { [classes.recording]: recording })}
                  onClick={() => {
                    if (mode === 'image') handleTakePhoto();
                    else if (mode === 'video' && !recording) handleStartRecording();
                    else if (mode === 'video' && recording) handleStopRecording();
                  }}
                />
              </Tippy>
            )}

            {mode === 'video' && (
              <Tippy content="Micro">
                <span onClick={() => setUseAudio(v => !v)}>
                  {!useAudio ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </span>
              </Tippy>
            )}
          </div>

          {errorMsg && <p className={classes.error}>{errorMsg}</p>}
        </>
      )}

      {/* Photo crop */}
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

      {/* Video preview */}
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
