import { FaPlay, FaPause, FaStop, FaCog, FaRegCircle, FaDotCircle } from "react-icons/fa";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import Tippy from "@tippyjs/react";
import Dropdown from "@/components/dropdown";
import { useEffect, useState } from "react";
import CardRecorder from "../newItem/itemTypes/card/cardRecorder";
import FileUploader from '@/components/fleUpload';
import styles from './styles.module.scss';
import VoiceOption from "./components/voiceOption";
import UploadOption from "./components/uploadOption";
import RecorderOption from "./components/recorderOption";

const ItemPlay = ({text, lang, voiceName, isUser}) => {
  const [recordings, setRecordings] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(voiceName);
  const [selectedSource, setSelectedSource] = useState("voice"); // 'voice' | 'file' | 'recorder'

  const {
    voices,
    playing,
    isPaused,
    handlePlay,
    handlePause,
    handleResume,
    handleStop
  } = useTextToSpeech({
    text,
    languageName: lang,
    voiceName: selectedVoice,
    selectedSource,
    uploadedFile,
    recordings,
  });
    
      const onVoiceCatSelect = (voiceName) => {
        setSelectedVoice(voiceName);
        }

      const handleFileChange = (file) => {
        setUploadedFile(file);
      };

      const onRecordingFinish = (blob) => {
        setRecordings((prev) => [...prev, blob]);
      };

      const handleDeleteRecording = (index) => {
        setRecordings((prev) => prev.filter((_, i) => i !== index));
      };

      const handleSelectSource = () => {
        if (uploadedFile) setSelectedSource("file");
        else if (recordings.length > 0) setSelectedSource("recorder");
        else setSelectedSource("voice");
      };

    return (
        <>
            {
                !playing && voices?.length > 0 && 
                <Tippy content='Listen to the article'>
                  <span>
                    <FaPlay onClick={handlePlay} />
                  </span>
                </Tippy>
            }
            {
                playing && 
                <>
                    <Tippy content='Stop reading'>
                      <span>
                        <FaStop onClick={handleStop} />
                      </span>
                    </Tippy>
                    <Tippy content='Pause reading'>
                      <span>
                        <FaPause onClick={isPaused ?  handleResume : handlePause} />
                      </span>
                    </Tippy>
                </>
            }
            {
              voices?.length > 0 &&
              <Dropdown
                trigger={<Tippy content='Config the voices'>
                    <span>
                      <FaCog />
                    </span>
                  </Tippy>}
                dropdownContainerSelector='#story-content'
                stopPropagation
                height={500}
              >
                {({ onClose }) => (
                <div id="voices-config">
                  <VoiceOption 
                    selectedSource={selectedSource} 
                    setSelectedSource={setSelectedSource} 
                    selectedVoice={selectedVoice}
                    voices={voices}
                    onVoiceCatSelect={onVoiceCatSelect}
                  />
                  {/* {
                    isUser &&
                    <>
                      <UploadOption
                        selectedSource={selectedSource}
                        setSelectedSource={setSelectedSource}
                        uploadedFile={uploadedFile}
                        handleFileChange={handleFileChange}
                      />
                      <RecorderOption
                        selectedSource={selectedSource}
                        setSelectedSource={setSelectedSource}
                        recordings={recordings}
                        onRecordingFinish={onRecordingFinish}
                        handleDeleteRecording={handleDeleteRecording}
                      />
                      <div className="buttons">    
                        <button className="btn" onClick={() => {
                          handleSelectSource();
                          onClose();
                          }}>
                          Select this {uploadedFile ? "file" : recordings.length > 0 ? "recording" : "voice"}
                        </button>
                        <button className="btn sub">
                          Add to Post
                        </button>
                      </div>
                    </>
                  } */}
                  
                </div>
              )}
              </Dropdown>
            }
        </>
    )
}

export default ItemPlay;