import classes from '../styles.module.scss';
import DateTimePicker from '@/components/timepicker';
import classNames from 'classnames';
import star from '@/assets/star.svg';
import Tooltip from '@/components/Utilities';
import RadioList from '@/components/radio';
import { useEffect, useRef, useState } from 'react';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import Dropdown from "@/components/dropdown";
import Checkbox from '@/components/checkbox';
import Tippy from '@tippyjs/react';
import useClickOutside from '@/hooks/useClickOutsite';
import LANGUAGES from '@/sharedConstants/languages';
import { getFlag } from '@/utils/lang';
import { getTitleByLang } from '@/utils/lang';
import Modal from '@/components/modal';
import { allVoices } from '@/utils/lang';

function useDebouncedValue(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export const Slug = ({data, setData,  originalSlug = ''}) => {
    // const [slug, setSlug] = useState('');
    const debouncedSlug = useDebouncedValue(data.slug);
    const [slugStatus, setSlugStatus] = useState(null);

    const onSlugChange = (e) => {
        setData({...data, slug: e.target.value});
    }
    useEffect(() => {
        if (!debouncedSlug) return;
        const fetchSlugStatus = async () => {
            // Nếu đang edit và slug không đổi thì coi như available
            if (originalSlug && debouncedSlug === originalSlug) {
                setSlugStatus('available');
                return;
            }
            try {
                const res = await api.get(`${urls.CHECK_SLUG}/${debouncedSlug}`);
                if (res.data) {
                    setSlugStatus(res.data.available ? 'available' : 'taken');
                }
            } catch (error) {
                setSlugStatus('invalid');
            }
    }

        fetchSlugStatus(); // Gọi hàm async
    }, [debouncedSlug]);

    useEffect(()=>{
        if (!data.slug) {
            setSlugStatus(null);
        }
    }, [data && data.slug]);

    return (
        <div className={classes.access}>
            <label>Custom URL (optional) <Tooltip content='This will be the link to your post. Only use letters, numbers, and dashes (a-z, 0-9, -)' /></label>
            <input type='text' className={classes.password} placeholder='your-custom-url' value={data && data.slug} onChange={onSlugChange} />
            {slugStatus === 'available' && <p className="text-green">✅ URL is available</p>}
            {slugStatus === 'taken' && <p className="text-red">❌ URL already taken</p>}
            {slugStatus === 'invalid' && <p className="text-yellow">⚠️ Invalid format (a-z, 0-9, - only)</p>}
            <div>
                <small>Your post URL will be: <strong>{window.location.origin}/post/{data.slug || "your-custom-url"}</strong></small>
            </div>
        </div>
    )
}

export const Vote = ({data, setData, user}) => {
    const [deadline, setDeadline] = useState(null);
    
    const handleWinnerRewardInput = (e) => {
        setData({...data, voteReward: e.target.value});
    }

    useEffect(()=>{
        if (deadline) {
            setData({...data, deadline: deadline, timezone: user.timezone});
        }
    }, [deadline]);
    return (
        <>
            <div>
                <label>Vote Mode <Tooltip content='User can vote 1 item or multi items' /></label>
                <RadioList 
                    list={['only-one', 'multi']}
                    value={data.voteMode || 'only-one'}
                    setValue={setData}
                    data={data}
                    datafield='voteMode'
                />
            </div>
            <div className={classes.date}>
                <DateTimePicker
                    value={data.deadline || deadline}
                    onChange={setDeadline}
                    label="Deadline Vote"
                    includeTime={true}
                    isFuture={true}
                />
                {/* {
                    user && user.timezone &&
                    <span>Your timezone: <strong>{user.timezone}</strong></span>
                } */}
            </div>
            {
                data && data.voteType !== 'custom' &&
                <div>
                    <label>Reward for each voter <Tooltip content='Your stars will use for this' /></label>
                    <div className={classes.flex}>
                        <input className={classNames(classes.text, classes.short)} type='number' min={0} value={data.voteReward || 0} onChange={handleWinnerRewardInput} />
                        <img src={star} height={20} />
                    </div>
                </div>
            }
        </>
    )
}

export const Languages = ({
  activeLang,
  setActiveLang,
  languages,
  newLang,
  setNewLang,
  copyContent,
  setCopyContent,
  onLanguageChange,
  removeLang,
  isView = false
}) => {
  const [showAddBox, setShowAddBox] = useState(false);
  const refBox = useRef();
  useClickOutside(refBox, () => setShowAddBox(false));

  const handleTabClick = (lang) => {
    setActiveLang(lang);
    onLanguageChange?.(lang, false);
  };

  const handleAdd = () => {
    if (!newLang || languages.includes(newLang)) return;
    onLanguageChange?.(newLang, true);
    setNewLang(null);
    setShowAddBox(false);
  };

  return (
    <div className={classes.languages}>
      <div className={classes.tabRow}>
        {languages.map((lang) => (
          <div
            key={lang}
            className={`${classes.tab} ${activeLang === lang ? classes.active : ""}`}
            onClick={() => handleTabClick(lang)}
          >
            {getFlag(lang)}
            {!isView && lang !== languages[0] && languages.length > 1 && (
              <span
                className={classes.remove}
                onClick={(e) => {
                  e.stopPropagation();
                  removeLang(lang);
                }}
              >
                ×
              </span>
            )}
          </div>
        ))}
        {!isView && languages.length < 4 && (
          <Tippy content="Add new translation">
            <div className={classNames(classes.tab, classes.add)} onClick={() => setShowAddBox(!showAddBox)}>
              ➕
            </div>
          </Tippy>
        )}
      </div>

      {showAddBox && (
        <div className={classes.translationBox} ref={refBox} id='translationBox'>
          <h4>New translation</h4>
          <div>
            <label>Language</label>
          <Dropdown
            curValue={newLang || "en-US"}
            list={LANGUAGES.filter((l) => !languages.includes(l.value))}
            onSelect={(selected) => setNewLang(selected.value)}
            width={200}
            dropdownHeight={135}
            returnObj={true}
            dropdownContainerSelector='#translationBox'
          />
          </div>
          <Checkbox
            label={"Copy current content"}
            isChecked={copyContent}
            setIsChecked={setCopyContent}
          />
          <button className={`btn ${classes.saveButton}`} onClick={handleAdd}>
            Add
          </button>
        </div>
      )}
    </div>
  );
};

export const TextToSpeech = ({languages, data, setData}) => {
  const [activeLang, setActiveLang] = useState(data.language);
  const [voices, setVoices] = useState(null);
  useEffect(() => {
    // Reset khi data.language thay đổi
    setActiveLang(data.language);
  }, [data.language]);

  const onVoiceCatSelect = (value) => {
        setData({...data, textToSpeech: {...data.textToSpeech, voice: value}});
    }

  const getVoices = (lang) => {
      const all = allVoices(lang);
      if (all.length) {
          const names = all.map(item => item.name);
          setVoices(names);
          setData({...data, textToSpeech: {...data.textToSpeech, voice: names[0]}});
      }
  }
  useEffect(()=>{
        const curLang = activeLang || user.lang;
        getVoices(curLang);
    }, [activeLang]);

  return (
    <div className={classes.access}>
      <label>Language</label>
      {languages.length > 1 && (
          <div className={classes.tabRow}>
              {languages.map((lang) => (
              <span
                  key={lang}
                  className={classNames(classes.tab, {
                  [classes.active]: activeLang === lang
                  })}
                  onClick={() => setActiveLang(lang)}
              >
                  {getFlag(lang)}
              </span>
              ))}
          </div>
          )}
      {
          voices && voices.length > 0 &&
          <div>
              <label>Voice</label>
              <Dropdown
                  curValue={data.textToSpeech?.voice || ''}
                  list={voices}
                  onSelect={onVoiceCatSelect}
                  width={150}
                  dropdownContainerSelector='#basicInfo'
              />
          </div>
      }
  </div>
  )
}
export const Title = ({ languages, setData, data }) => {
  const [activeTitleLang, setActiveTitleLang] = useState(data.language);

  useEffect(() => {
    // Reset khi data.language thay đổi
    setActiveTitleLang(data.language);
  }, [data.language]);

  const onSingleLangTitleChange = (e) => {
    setData({ ...data, title: e.target.value });
  };

  const onMultiLangTitleChange = (newTitle, lang) => {
    setData(prev => {
      const updated = { ...prev };
      if (lang === updated.language) {
        updated.title = newTitle;
      } else {
        const i = updated.translations?.findIndex(t => t.lang === lang);
        if (i !== -1) {
          updated.translations[i].title = newTitle;
        } else {
          updated.translations = [
            ...(updated.translations || []),
            { lang, title: newTitle }
          ];
        }
      }
      return updated;
    });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (languages.length > 1) {
      onMultiLangTitleChange(value, activeTitleLang);
    } else {
      onSingleLangTitleChange(e);
    }
  };

  const currentTitle = languages.length > 1
    ? getTitleByLang(data, activeTitleLang)
    : data?.title;

  return (
    <div className={classes.title}>
      <label>Title</label>

      {languages.length > 1 && (
        <div className={classes.tabRow}>
          {languages.map((lang) => (
            <span
              key={lang}
              className={classNames(classes.tab, {
                [classes.active]: activeTitleLang === lang
              })}
              onClick={() => setActiveTitleLang(lang)}
            >
              {getFlag(lang)}
            </span>
          ))}
        </div>
      )}

      <input
        className={classes.text}
        type="text"
        value={currentTitle}
        onChange={handleChange}
      />
    </div>
  );
};

export const LanguageModal = ({setShowLanguage, setNewLang, newLang, setData}) => {
  const onLangUpdate = () => {
        setData(prev => (
            {...prev, language: newLang}
        ));
        setShowLanguage(false);
    }
  return (
    <Modal setShowModal={setShowLanguage} width={400}>
        <div className={classes.postLang} id='postLang'>
            <h2>Primary language for this post</h2>
            <p className='note'>This helps us show your post to the right audience.</p>
            <Dropdown
                curValue={newLang || navigator.language || navigator.userLanguage || "en-US"}
                list={LANGUAGES}
                onSelect={(selected) => setNewLang(selected.value)}
                label={"Language"}
                width={260}
                returnObj={true}
                dropdownContainerSelector='#postLang'
            />
            <button className="btn" onClick={onLangUpdate}>{newLang === navigator.language ? 'Ok' : 'Update'}</button>
        </div>
    </Modal>
  )
}