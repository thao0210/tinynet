// AddVoice.jsx
import Dropdown from "@/components/dropdown";
import classes from "../styles.module.scss";
import { capitalFirstLetter, voiceLanguages } from "@/utils/lang";
import Tippy from "@tippyjs/react";
import { useEffect, useRef, useState } from "react";
import { FaMicrophone } from "react-icons/fa";
import { MdFiberManualRecord } from "react-icons/md";
import classNames from "classnames";

const AddVoice = ({ editor, data }) => {
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [langs, setLangs] = useState([]);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const getSpeechRecognition = () => {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      console.error("Microphone permission denied:", err);
      return false;
    }
  };

  const onLanguageSelect = (value) => {
    setLang(value);
  };

  const initRecognition = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang || navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript.toLowerCase();
        }
      }
      editor.commands.insertContent(capitalFirstLetter(finalTranscriptRef.current));
    };

    recognition.onend = () => {
      if (listening) {
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
    if (!recognitionRef.current) return;

    finalTranscriptRef.current = "";
    recognitionRef.current.lang = lang || navigator.language || "en-US";

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.error("Start listening error:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Stop listening error:", err);
      }
    }
    setListening(false);
  };

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
        setSupported(false);
        setLangs([{ label: "Not supported (English)", value: "en-US" }]);
        return;
    }

    setLang(navigator.language || "en-US");

    voiceLanguages((loadedLangs) => {
        if (!loadedLangs.length) {
        // Chỉ set unsupported khi đã timeout mà vẫn không load được
        setSupported(false);
        setLangs([{ label: "Not supported (English)", value: "en-US" }]);
        } else {
        setSupported(true);
        setLangs(loadedLangs);
        }
    });
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
      width="230px"
    >
      <div className={classes.voice2Text} id="voice2Text">
        <label>Language</label>
        <Dropdown
          curValue={lang}
          list={langs}
          onSelect={onLanguageSelect}
          width={200}
          dropdownContainerSelector="#voice2Text"
          disabled={!supported}
        />
        {lang && (
          <div>
            <label>Voice to text</label>
            <div>
              {!listening ? (
                <button
                  className="btn"
                  onClick={startListening}
                  disabled={!supported}
                >
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
        {!supported && (
          <p style={{ color: "red", marginTop: "5px" }}>
            Speech recognition is not supported on this device/browser.
          </p>
        )}
      </div>
    </Dropdown>
  );
};

export default AddVoice;