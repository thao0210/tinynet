import { useRef, useState, useEffect } from 'react';
import classes from './styles.module.scss';
import Tippy from '@tippyjs/react';
import ScreenContent from './screenContent';
import ScreenOption from './screenOption';
import CardPreview from './cardPreview';
import ScreenMenus from './ScreenMenus';
import SoundModal from './soundModal';
import {useStore} from '@/store/useStore';
import { Languages } from '../generalComponents';

const ScreenThumb = ({screen, screens, setScreens, setActiveScreenIndex, activeScreenIndex, idx}) => {
  const deleteScreen = (index) => {
    if (screens.length <= 1) return;
    const newScreens = [...screens];
    newScreens.splice(index, 1);
    setScreens(newScreens);
    setActiveScreenIndex(Math.max(0, index - 1));
  };

  return (
    <div
      key={screen.id}
      onClick={() => setActiveScreenIndex(idx)}
      className={activeScreenIndex === idx ? classes.active : ''}
    >
      <div className={classes.thumb}>
        <Tippy content={`Screen ${idx + 1}`}>
          <div style={{
            width: 50,
            height: 50,
            backgroundColor: screen.background?.color || '#000000',
            backgroundImage: screen.thumbnail ? `url(${screen.thumbnail})` : 'none',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            border: '1px solid #ccc'
          }} />
        </Tippy>
      </div>
      {screens.length > 1 &&
        <span onClick={() => deleteScreen(idx)}>✕</span>
      }
    </div>
  )
}

const Card = ({ data, setData }) => {
  const [showScreenOptions, setShowScreenOptions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [screens, setScreens] = useState([]);
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [music, setMusic] = useState({
    url: '',
    file: null
  });
  const [recorder, setRecorder] = useState(null);
  const [showCardReview, setShowCardReview] = useState(false);
  const contentRef = useRef();
  const [showSound, setShowSound] = useState(false);
  const [naturalSounds, setNaturalSounds] = useState([]);
  const [uploadedMusicFile, setUploadedMusicFile] = useState(null);
  // lang -> id -> text
  const [cardTextContent, setCardTextContent] = useState({});
  const {user} = useStore();
  const [activeLang, setActiveLang] = useState(data?.language || user?.lang || navigator?.language || 'en-US');
  const [newLang, setNewLang] = useState(user.lang || navigator.language || 'en-US');
  const [languages, setLanguages] = useState([activeLang]);
  const [searchContent, setSearchContent] = useState('');
  
  const addNewScreen = () => {
    setScreens(prev => ([
      ...prev,
      {
        id: prev.length,
        time: 5,
        background: {
          type: '',
          color: '#000000',
          url: '',
          file: null
        },
        transition: 'fade',
        backgroundType: 'none',
        textboxes: []
      }
    ]));
    setActiveScreenIndex(screens.length);
  };

  const updateTextbox = (id, newData, lang) => {
    const updatedScreens = [...screens];
    const screen = updatedScreens[activeScreenIndex];
    const idx = screen.textboxes.findIndex(b => b.id === id);
    if (idx === -1) return;
    const box = screen.textboxes[idx];
    if (!box) return;

    if (newData.text !== undefined) {
      setCardTextContent(prev => {
        const base = { ...(prev || {}) };
        return {
          ...base,
          [lang]: {
            ...(base[lang] || {}),
            [id]: newData.text
          }
        };
      });
      setSearchContent(prev => `${prev} ${newData.text}`);
    }

    const { text, ...styleData } = newData;
    screen.textboxes[idx] = { ...box, ...styleData };
    setScreens(updatedScreens);
  };

  const deleteTextbox = (index) => {
    const updatedScreens = [...screens];
    updatedScreens[activeScreenIndex].textboxes.splice(index, 1);
    setScreens(updatedScreens);
  };

  const handlePlay = () => {
    setShowCardReview(true);
  };

  const handleClose = () => {
    setShowCardReview(false);
  };

  const handleLanguageChange = (lang, isNew) => {
    if (isNew && !languages.includes(lang)) {
      setLanguages(prev => [...prev, lang]);
      setCardTextContent(prev => ({
        ...prev,
        [lang]: {}
      }));
    }
    setActiveLang(lang);
  };

  // Remove language
  const removeLang = (lang) => {
    setLanguages(prev => prev.filter(l => l !== lang));
    setCardTextContent(prev => {
      const { [lang]: _, ...rest } = prev;
      return rest;
    });
    if (activeLang === lang) {
      setActiveLang(languages[0] || 'en-US');
    }
  };

  // Cập nhật cardDetails
  useEffect(() => {
    setData(prev => {
      const newData = {
        ...prev,
        cardDetails: { screens, music, recorder, naturalSounds },
        cardTextContent,
        searchContent,
      };

      // Nếu giống hệt thì không set để tránh cha tạo object mới vô ích
      if (JSON.stringify(prev) === JSON.stringify(newData)) {
        return prev;
      }
      return newData;
    });
  }, [screens, music, recorder, naturalSounds, cardTextContent, searchContent]);

  const hasInitRef = useRef(false);

  useEffect(() => {
  // chỉ init 1 lần khi mount
    if (!hasInitRef.current) {
      hasInitRef.current = true;

      if (data?.cardDetails?.screens?.length) {
        const details = data.cardDetails;
        setScreens(details.screens);
        setMusic(details.music || { url: '', file: null });
        setRecorder(details.recorder || null);
        setNaturalSounds(details.naturalSounds || []);
      } else {
        addNewScreen();
      }
    }

    if (data?.searchContent) {
      setSearchContent(data.searchContent);
    }

    // sync textContent từ cha, nhưng chỉ khi cha thực sự có dữ liệu mới
    if (data?.cardTextContent) {
      setCardTextContent(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data.cardTextContent)) {
          return prev; // tránh set thừa gây loop
        }
        return data.cardTextContent;
      });

      const langs = new Set(Object.keys(data.cardTextContent));
      if (langs.size > 0) {
        setLanguages(Array.from(langs));
      }
    }
  }, []);

  return (
    <div className={classes.card}>
      <div className={classes.sidebar}>
        {
          screens.length > 0 &&
          <>
            <Tippy content={'Play the card'}>
              <div className={classes.play} onClick={handlePlay}>▶</div>
            </Tippy>
            <Tippy content={'Background music and recorder'}>
              <div className={classes.speaker} onClick={() => setShowSound(true)}>
                <img src='/speaker.svg' width={22} />
              </div>
            </Tippy>
          </>
        }
        
        {screens.map((screen, idx) => (
          <ScreenThumb
            screen={screen}
            key={`screen${idx}`}
            screens={screens}
            setScreens={setScreens}
            setActiveScreenIndex={setActiveScreenIndex}
            activeScreenIndex={activeScreenIndex}
            idx={idx}
          />
        ))}
        <Tippy content={'New screen'}>
          <span onClick={addNewScreen}>+</span>
        </Tippy>
      </div>

      {
        screens.length > 0 &&
        <ScreenMenus 
          activeScreenIndex={activeScreenIndex} 
          setShowScreenOptions={setShowScreenOptions}
          ref={contentRef}
          screens={screens}
          setScreens={setScreens}
          setActiveIndex={setActiveIndex}
        />
      }
      
      <ScreenContent
        screen={screens[activeScreenIndex]}
        updateTextbox={updateTextbox}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        classes={classes}
        ref={contentRef}
        deleteTextbox={deleteTextbox}
        showCardReview={showCardReview}
        cardTextContent={cardTextContent}
        currentLang={activeLang}
      />

      {showScreenOptions && (
        <ScreenOption
          screens={screens}
          setScreens={setScreens}
          setShowScreenOptions={setShowScreenOptions}
          activeScreenIndex={activeScreenIndex}
        />
      )}

      {showCardReview && data.cardDetails && (
        <CardPreview 
          data={data.cardDetails} 
          onClose={handleClose}
          uploadedMusicFile={uploadedMusicFile}
          cardTextContent={cardTextContent}
         />
      )}

      {
        showSound &&
        <SoundModal 
          setShowSound={setShowSound}
          music={music}
          setMusic={setMusic}
          setRecorder={setRecorder}
          naturalSounds={naturalSounds}
          setNaturalSounds={setNaturalSounds}
          uploadedFile={uploadedMusicFile}
          setUploadedFile={setUploadedMusicFile}
        />
      }
      <Languages
        activeLang={activeLang}
        setActiveLang={setActiveLang}
        languages={languages}
        newLang={newLang}
        setNewLang={setNewLang}
        onLanguageChange={handleLanguageChange}
        removeLang={removeLang}
      />
    </div>
  );
};

export default Card;
