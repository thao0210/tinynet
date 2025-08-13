import React, { useState, useEffect, useRef } from "react";
import { franc } from "franc-min";

// const voicesMap = {
//   English: "en-US",
//   Vietnamese: "vi-VN",
//   French: "fr-FR",
//   Spanish: "es-ES"
// };

const musicTracks = [
  { name: "None", url: "" },
  { name: "Relaxing", url: "https://www.example.com/relaxing.mp3" },
  { name: "Focus", url: "https://www.example.com/focus.mp3" }
];

const TextToSpeech = ({ text }) => {
  const [detectedLang, setDetectedLang] = useState("English");
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [voicesMap, setVoicesMap] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [music, setMusic] = useState("");
  const [playing, setPlaying] = useState(false);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
  });

  useEffect(() => {
    const voices = window.speechSynthesis.getVoices();
    const languages = [...new Set(voices.map(v => v.lang))];
    const langs = languages.map(v => ({
      name: languageNames.of(v),
      lang: v
    }));
    setVoicesMap(langs);
  }, []);

  useEffect(() => {
    const langCode = franc(text);
    const fullLang = languageNames.of(langCode) || "English";
    setDetectedLang(fullLang);
    setSelectedLang(fullLang);
  }, [text]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      const allVoices = synth.getVoices().filter(v => v.lang === selectedLang);
      setVoices(allVoices);
      setSelectedVoice(allVoices[0]?.name || "");
    };
    synth.onvoiceschanged = loadVoices;
    loadVoices();
  }, [selectedLang]);

  const handlePlay = () => {
    if (!text) return;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices.find(v => v.name === selectedVoice);
    utteranceRef.current = utterance;

    synth.speak(utterance);
    setPlaying(true);

    if (music) {
      audioRef.current = new Audio(music);
      audioRef.current.loop = true;
      audioRef.current.play();
    }

    utterance.onend = () => setPlaying(false);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    if (audioRef.current) audioRef.current.pause();
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    if (audioRef.current) audioRef.current.play();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) audioRef.current.pause();
    setPlaying(false);
  };

  return (
    <div>
      <h3>Text-to-Speech</h3>
      <div>
        <label>Detected Language: </label>
        <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
          {voicesMap.map((lang) => (
            <option key={lang.lang} value={lang.lang}>{lang.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Voice: </label>
        <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>{voice.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Background Music: </label>
        <select value={music} onChange={(e) => setMusic(e.target.value)}>
          {musicTracks.map(track => (
            <option key={track.name} value={track.url}>{track.name}</option>
          ))}
        </select>
      </div>
      <button onClick={handlePlay} disabled={playing}>Play</button>
      <button onClick={handlePause} disabled={!playing}>Pause</button>
      <button onClick={handleResume} disabled={!playing}>Resume</button>
      <button onClick={handleStop} disabled={!playing}>Stop</button>
    </div>
  );
};

export default TextToSpeech;
