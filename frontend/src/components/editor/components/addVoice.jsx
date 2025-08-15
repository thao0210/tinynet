import Dropdown from "../../dropdown";
import classes from '../styles.module.scss';
import { capitalFirstLetter, voiceLanguages } from "@/utils/lang";
import Tippy from "@tippyjs/react";
import { useEffect, useRef, useState } from "react";
import { FaMicrophone } from 'react-icons/fa';
import { MdFiberManualRecord } from "react-icons/md";
import classNames from "classnames";

const AddVoice = ({ editor, data }) => {
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  const [lang, setLang] = useState("en-US");
  const langs = voiceLanguages();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // Kiểm tra API hỗ trợ
  const getSpeechRecognition = () => {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Microphone permission granted");
      return true;
    } catch (err) {
      console.error("❌ Microphone permission denied:", err);
      return false;
    }
  };

  const onLanguageSelect = (value) => {
    console.log("Language selected:", value);
    setLang(value);
  };

  const initRecognition = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      alert("Speech Recognition API is not supported in this browser/PWA.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang || navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current +=
            result[0].transcript.toString().toLowerCase();
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      editor.commands.insertContent(
        capitalFirstLetter(finalTranscriptRef.current)
      );
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      if (listening) {
        // Auto restart nếu browser cho phép
        try {
          recognition.start();
        } catch (err) {
          console.error("Auto-restart failed:", err);
        }
      } else {
        editor.commands.insertContent(". ");
      }
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const startListening = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    if (!recognitionRef.current) {
      initRecognition();
    }
    if (!recognitionRef.current) return; // nếu vẫn không khởi tạo được

    finalTranscriptRef.current = "";
    recognitionRef.current.lang = lang || navigator.language || "en-US";

    try {
      recognitionRef.current.start();
      console.log("🎤 Listening started");
      setListening(true);
    } catch (err) {
      console.error("Start listening error:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("🛑 Listening stopped");
      } catch (err) {
        console.error("Stop listening error:", err);
      }
    }
    setListening(false);
  };

  useEffect(() => {
    const userLang = navigator.language || navigator.userLanguage || "en-US";
    setLang(userLang);
  }, []);

  return (
    <Dropdown
      trigger={
        <Tippy content="Voice to Text">
          <span>
            <FaMicrophone size={18} />
          </span>
        </Tippy>
      }
      className={classes.imagesList}
      showDropdown={showVoiceOptions}
      setShowDropdown={setShowVoiceOptions}
      dropdownContainerSelector="#editor"
    >
      <div className={classes.voice2Text} id="voice2Text">
        <label>Language</label>
        <Dropdown
          curValue={lang || data?.language || "en-US"}
          list={langs}
          onSelect={onLanguageSelect}
          width={200}
          dropdownContainerSelector="#voice2Text"
        />
        {lang && (
          <div>
            <label>Voice to text</label>
            <div>
              {!listening ? (
                <button className="btn" onClick={startListening}>
                  <MdFiberManualRecord size={20} /> Start speaking
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className={classNames("btn", classes.stop)}
                >
                  <MdFiberManualRecord size={20} /> Stop & Save
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Dropdown>
  );
};
export default AddVoice;