import { useEffect, useRef, useState } from "react";

export function useTextToSpeech({
  text,
  languageName,
  voiceName,
  selectedSource = "voice", // 'voice' | 'file' | 'recorder'
  uploadedFile = null,
  recordings = [],
}) {
  const [playing, setPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  useEffect(() => {
    if (!languageName || !synth) return;

    const waitForVoices = new Promise((resolve) => {
      const voices = synth.getVoices();
      if (voices.length) return resolve(voices);

      const listener = () => {
        resolve(synth.getVoices());
        synth.removeEventListener("voiceschanged", listener);
      };

      synth.addEventListener("voiceschanged", listener);
      setTimeout(() => {
        resolve(synth.getVoices());
        synth.removeEventListener("voiceschanged", listener);
      }, 3000);
    });

    waitForVoices.then((all) => {
      const filtered = all.filter((v) => v.lang === languageName);
      setVoices(filtered);
    });
  }, [languageName]);

  const handlePlay = () => {
    handleStop();

    if (selectedSource === "file" && uploadedFile) {
      const audio = new Audio(URL.createObjectURL(uploadedFile));
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.play();
      setPlaying(true);
    } else if (selectedSource === "recorder" && recordings.length > 0) {
      const combinedBlob = new Blob(recordings, { type: "audio/webm" });
      const audio = new Audio(URL.createObjectURL(combinedBlob));
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.play();
      setPlaying(true);
    } else if (selectedSource === "voice" && text && voices.length) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices.find((v) => v.name === voiceName) || voices[0];
      utterance.onend = () => setPlaying(false);
      utteranceRef.current = utterance;
      synth.cancel();
      setTimeout(() => {
        synth.speak(utterance);
        setPlaying(true);
      }, 100);
    }
  };

  const handlePause = () => {
    if (selectedSource === "voice") {
      synth.pause();
    } else {
      audioRef.current?.pause();
    }
    setIsPaused(true);
  };

  const handleResume = () => {
    if (selectedSource === "voice") {
      synth.resume();
    } else {
      audioRef.current?.play();
    }
    setIsPaused(false);
  };

  const handleStop = () => {
    if (selectedSource === "voice") {
      synth.cancel();
    } else {
      audioRef.current?.pause();
      audioRef.current = null;
    }
    setPlaying(false);
    setIsPaused(false);
  };

  return {
    voices,
    playing,
    isPaused,
    handlePlay,
    handlePause,
    handleResume,
    handleStop,
  };
}
