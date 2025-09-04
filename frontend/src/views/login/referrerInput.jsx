import { useState } from "react";
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import styles from './styles.module.scss';
import Tippy from '@tippyjs/react';
import { MdPerson } from "react-icons/md";

const ReferrerInput = ({setData, emailAvailable}) => {
  const [referrer, setReferrer] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null);

  const checkReferrer = async () => {
    if (!referrer) {
      setStatus(null);
      return;
    }
    try {
      const res = await api.get(`${urls.VERIFY_REFERRER}/${referrer}`);
      setStatus(res.data.valid ? "valid" : "invalid");
      setMessage(res.data.message || '');
      if (res.data.valid) {
        setData(prev => ({...prev, referrer: referrer}))
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Referral username (optional)"
        value={referrer}
        onChange={(e) => setReferrer(e.target.value)}
        onBlur={checkReferrer}
      />
      <div>referrer is only for new registered users</div>
      <MdPerson />
      {status === "valid" && 
      <Tippy content={message}>
        <span className={styles.inside} style={{ color: "green" }}>✅</span>
      </Tippy>
      }
      {status === "invalid" && 
        <Tippy content={message}>
            <span className={styles.inside} style={{ color: "red" }}>❌</span>
        </Tippy>
      }
      {status === "error" && 
      <Tippy content={message}>
        <span className={styles.inside} style={{ color: "orange" }}>⚠️</span>
      </Tippy>
      }
    </div>
  );
};

export default ReferrerInput;