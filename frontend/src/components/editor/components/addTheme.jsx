import { useState, useEffect, useRef } from "react";
import GradientPicker from "@/components/gradientPicker";
import Dropdown from "@/components/dropdown";
import classes from '../styles.module.scss';
import api from '@/services/api';
import urls from '@/sharedConstants/urls';
import Tippy from "@tippyjs/react";
import { useStore } from '@/store/useStore';
import Shapes from "./shapes";

const AddTheme = ({setData, data, showThemes, setShowThemes, setShowSideModal, loadListTheme, setLoadListTheme}) => {
  const [listThemes, setListThemes] = useState([]);
  const {user,customValues, setCustomValues} = useStore();
  const baseUrl = import.meta.env.VITE_R2_BASE_URL;
  const imageArray = Array.from({ length: 16 }, (_, i) => `${baseUrl}/dec/${i + 1}.webp`);

  const onGradientChange = (value) => {
    setData({...data, theme: value});
  }
  
  const getListTheme = async () => {
    try {
      const listTheme = await api.get(urls.GET_THEMES_LIST);
      if (listTheme.data) {
        setListThemes(listTheme.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadListTheme(false);
    }
  }

  const newThemeClick = () => {
    setShowSideModal(true);
    setShowThemes(false);
  } 

  const selectTheme = async (id) => {
    try {
      const theme = await api.get(`${urls.GET_THEMES_LIST}/${id}`);
      if (theme.data) {
        setCustomValues(theme.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const deleteTheme = async (id) => {
     try {
      const theme = await api.delete(`${urls.GET_THEMES_LIST}/${id}`);
      if (theme.data) {
        setLoadListTheme(true);
        if (customValues?._id == id) {
          setCustomValues({});
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(()=>{
    if (data.themeType === 'colors') {
      setData({...data, theme: 'colors'});
    }

    if (data.themeType === 'presets' && !data.theme) {
      setData({...data, theme: 'theme1'});
    }

    if (data.themeType === 'shapes' && !data.themeShape?.name) {
      setData({...data, theme: 'shapes', themeShape: {name: 'mix'}});
    }

    if (data.themeType === 'custom') {
      setData({...data, theme: 'custom'});
      getListTheme();
    }
  }, [data?.themeType]);

  useEffect(() => {
    loadListTheme && getListTheme();
  }, [loadListTheme]);

  useEffect(() => {
    if (showThemes && !data.themeType) {
      setData({...data, themeType: 'colors'});
    }
  }, []);
  return (
    <Dropdown
        className={classes.imagesList} 
        width={350} 
        label={'Themes'}
        trigger={<Tippy content='Add theme'><img src="/theme-icon.webp" width={20} alt="theme" onClick={() => {
          setShowThemes(true);
          setShowSideModal(false);
        }
        } /></Tippy>}
        dropdownContainerSelector='#editor'
    >
        <div className={classes.themes}>
            <div className={classes.themeType}>
              {
                ['colors', 'presets', 'shapes', 'custom'].map((item, index) => (
                  <span key={`type${index}`} onClick={() => {setData({...data, themeType: item})}} className={item === data.themeType ? classes.active : ''}>
                    {item}
                  </span>
                ))
              }
            </div>
            {
              data.themeType === 'colors' &&
              <div>
                <label>One Color</label>
                <div className={data?.themeType && data?.theme ? classes.active : ''}>
                  <input type='color' value={data?.themeType && data?.theme ? data.theme : '#FFFFFF'} onChange={(e) => setData({...data, theme: e.target.value})}/>
                </div>
                <label>Gradient</label>
                <GradientPicker onChange={onGradientChange} initialValue={data?.theme} autoUpdate={true} />
              </div>
              
            }
            {
               data.themeType === 'presets' &&
              <div className={classes.images}>
                {
                  imageArray.length > 0 && data.type !== 'card' &&
                  imageArray.map((item, index) => 
                      <img src={item} height={40} alt='theme' key={`theme${index}`} onClick={() => setData({...data, theme: 'theme'+(index+1)})} className={data.theme === `theme${index+1}` ? classes.active : ''} />
                  )
                }
              </div>
            }
            {
              data.themeType === 'shapes' &&
                <Shapes data={data} setData={setData} />
            }
            {
              data.themeType === 'custom' &&
              <div className={classes.custom}>
                <div>
                  <h4>Themes</h4>
                  <div className={classes.listThemes}>
                    <ul>
                      <Tippy content='New theme'>
                        <li className={classes.new} onClick={newThemeClick} >+</li>
                      </Tippy>
                      {
                        listThemes.length > 0 &&
                        listThemes.map((item, index) => (
                          <li key={`theme${index}`} className={item._id === customValues?._id ? classes.active : ''}>
                            <Tippy content={item.name}>
                              <div style={{background: `${item.color} url("${item?.coverImage || ''}") no-repeat center center/contain`}}
                                onClick={() => selectTheme(item._id)}
                              >
                              </div>
                            </Tippy>
                            {
                              item.userId === user._id &&
                              <span onClick={() => deleteTheme(item._id)}>×</span>
                            }
                            
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                </div>
              </div>
            }
            
            {
                data.type === 'card' &&
                cardImgArray.length > 0 &&
                cardImgArray.map((item, index) => 
                    <img src={item} height={40} alt='theme' key={`theme${index}`} onClick={() => setData({...data, theme: 'themecard'+(index+1)})} className={data.theme === `themecard${index+1}` ? classes.active : ''} />
                )
            }
        </div>
    </Dropdown>
  )
}

export default AddTheme;