import Dropdown from "@/components/dropdown";
import styles from "../styles.module.scss";
import { SelectorIcon } from "@/components/radio";

const VoiceOption = ({ selectedSource, setSelectedSource, selectedVoice, voices, onVoiceCatSelect }) => (
  <div className={styles.optionGroup}>
    <span onClick={() => setSelectedSource("voice")} className={styles.selector}>
      <SelectorIcon selected={selectedSource === "voice"} />
    </span>
    <div className={selectedSource !== "voice" ? styles.disabled : ""}>
      <label>Voice</label>
      <Dropdown
        curValue={selectedVoice || voices[0]?.voiceURI || ""}
        list={voices.map((v) => ({
          value: v.voiceURI,
          label: `${v.name} (${v.lang})`,
          lang: v.lang,
        }))}
        onSelect={onVoiceCatSelect}
        width={150}
        dropdownContainerSelector="#voices-config"
        isVoice={true}
        stopPropagation
      />
    </div>
  </div>
);

export default VoiceOption;