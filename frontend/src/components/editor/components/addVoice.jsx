import Dropdown from "../../dropdown";
import classes from '../styles.module.scss';
import { capitalFirstLetter, voiceLanguages } from "@/utils/lang";
import Tippy from "@tippyjs/react";
import { useEffect, useRef, useState } from "react";
import { FaMicrophone } from 'react-icons/fa';
import { MdFiberManualRecord } from "react-icons/md";
import classNames from "classnames";

const AddVoice = ({editor}) => {
    const [showVoiceOptions, setShowVoiceOptions] = useState(false);
    const [lang, setLang] = useState('en-US');
    const langs = voiceLanguages();
    // const langsNames = langs.map(item => item.name);
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef(""); // lưu toàn bộ đoạn nói

    const onLanguageSelect = (value) => {
        console.log('v', value);
        setLang(value);
    }

    const initRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = lang; // hoặc "en-US" tuỳ ngôn ngữ
        recognition.interimResults = true;
        recognition.continuous = true;

        let finalTranscript = "";
        recognition.onresult = (event) => {
            let interimTranscript = "";
          
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscriptRef.current += result[0].transcript.toString().toLowerCase();
              } else {
                interimTranscript += result[0].transcript;
              }
            }
          
            editor.commands.insertContent(capitalFirstLetter(finalTranscriptRef.current));
          };
    
        recognition.onend = () => {
          setListening(false);
          editor.commands.insertContent('. ');
        };
    
        recognitionRef.current = recognition;
    };
    
    const startListening = () => {
        if (!recognitionRef.current) {
            initRecognition();
        }
        finalTranscriptRef.current = "";
        recognitionRef.current.start();
        setListening(true);
    };
    
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        // downloadAsMp3(finalTranscriptRef.current);
    };

    useEffect(()=>{
        const userLang = navigator.language || navigator.userLanguage;
        setLang(userLang);
    },[]);


    return (
        <Dropdown
            trigger={<Tippy content='Voice to Text'><span><FaMicrophone size={18} /></span></Tippy>} 
            className={classes.imagesList} 
            showDropdown={showVoiceOptions}
            setShowDropdown={setShowVoiceOptions}
            dropdownContainerSelector='#editor'
        >
            <div className={classes.voice2Text} id="voice2Text">
                <label>Language</label>
                <Dropdown
                    curValue={lang || 'en-US'}
                    list={langs}
                    onSelect={onLanguageSelect}
                    width={200}
                    dropdownContainerSelector='#voice2Text'
                />
                {
                    lang &&
                    <div>
                        <label>Voice to text</label>
                        <div>
                        {
                          !listening ? (
                          <button className="btn" onClick={startListening}><MdFiberManualRecord size={20} /> Start speaking</button>
                          ) : (
                          <button onClick={stopListening} className={classNames('btn', classes.stop)}><MdFiberManualRecord size={20} /> Stop & Save</button>
                          )}
                        </div>
                    </div>
                }
            </div>
        </Dropdown>
    )
}

export default AddVoice;