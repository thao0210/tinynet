import classes from '../styles.module.scss';
import TiptapEditor from '@/components/editor';
import { Languages } from './generalComponents';
import { useEffect, useState, useMemo } from 'react';
import { getActiveContent } from '@/utils/lang';
import RainEffect, { AnimatedBackground, RandomShapesBackground } from '@/components/themes';
import { themeBg } from '@/utils/color';
import classNames from 'classnames';
import {getBrightIndex} from '@/utils/color';
import themeClasses from '@/views/list/viewItem/themes.module.scss';
import { setBackground } from '@/utils/color';
import { useStore } from '@/store/useStore';

const Post = ({ data, setData, languages, onContentChange, activeLang, setActiveLang }) => {
  const [newLang, setNewLang] = useState("en-US");
  const [copyContent, setCopyContent] = useState(false);
  const {customValues} = useStore();

  const themeToType = {
    theme12: 'cloud',
    theme13: 'river',
    theme14: 'field',
    theme15: 'music',
    theme16: 'balloon'
  };
  const selectedType = themeToType[data?.theme];
  const updateActiveText = (newText) => {
    setData((prev) => {
      const updated = { ...prev };
      if (activeLang === updated.language) {
        updated.text = newText;
      } else {
        const index = updated.translations?.findIndex(t => t.lang === activeLang);
        if (index !== -1) {
          updated.translations[index].text = newText;
        }
      }
      return updated;
    });
  };

  const handleLanguageChange = (lang, isNew) => {
    setActiveLang(lang);

    if (isNew) {
      setData((prev) => {
        const updated = { ...prev };
        if (!updated.translations) updated.translations = [];

        const exists = updated.translations.find((t) => t.lang === lang);
        if (!exists) {
          const source =
            activeLang === updated.language
              ? { content: updated.content, text: updated.text }
              : updated.translations.find(t => t.lang === activeLang) || {};

          updated.translations.push({
            lang,
            content: copyContent ? source.content || "" : "",
            text: copyContent ? source.text || "" : ""
          });
        }

        return updated;
      });
    }
  };

  const handleRemoveLang = (langToRemove) => {
    setData((prev) => {
      const updated = { ...prev };
      updated.translations = (updated.translations || []).filter(t => t.lang !== langToRemove);

      if (activeLang === langToRemove) {
        const fallbackLang = updated.language || updated.translations[0]?.lang || "en-US";
        setActiveLang(fallbackLang);
      }

      return updated;
    });
  };

  return (
    <div className={classNames(classes.post, themeClasses.theme, themeClasses[data?.theme], {[themeClasses.dark]: data?.themeType === 'colors' && getBrightIndex(data?.theme) < 150 })} style={ data?.themeType === 'custom' && customValues ? setBackground(customValues?.images, customValues?.color) : {background: data?.themeType === 'colors' && data?.theme ? data.theme : ''}}>
      <div>
        <TiptapEditor
          setData={setData}
          data={data}
          content={getActiveContent(activeLang, data)?.content}
          onContentChange={onContentChange}
          onTextChange={updateActiveText}
          useSmallText={true}
        />
      </div>
      <Languages
        activeLang={activeLang}
        setActiveLang={setActiveLang}
        languages={languages}
        newLang={newLang}
        setNewLang={setNewLang}
        copyContent={copyContent}
        setCopyContent={setCopyContent}
        onLanguageChange={handleLanguageChange}
        removeLang={handleRemoveLang}
      />
      {
          ['theme8', 'theme9', 'theme10', 'theme11'].includes(data?.theme) &&
          <RainEffect count={themeBg(data.theme).count} minLength={themeBg(data.theme).minLength} maxLength={themeBg(data.theme).maxLength} speed={themeBg(data.theme).speed} background={themeBg(data.theme).background} rainColor={themeBg(data.theme).rainColor} angle={themeBg(data.theme).angle} />
      }
      {
        ['theme12','theme13','theme14','theme15', 'theme16'].includes(data?.theme) &&
        <AnimatedBackground type={selectedType} />
      }
      {
        data?.themeType === 'shapes' && data?.themeShape &&
        <div>
          <RandomShapesBackground themeShape={data?.themeShape} />
        </div>
      }
    </div>
  );
};

export default Post;