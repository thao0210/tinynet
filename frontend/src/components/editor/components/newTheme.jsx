import ThemeImageItem from "./themeImageItem";
import classes from '../styles.module.scss';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import RadioList from '@/components/radio';
import SearchUsers from '@/components/searchUsers';
import { LoadingDots } from "@/components/loader";
import { uploadBase64ToR2 } from "@/utils/file";
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { PRIVACY_DATA } from "@/sharedConstants/data";

const NewTheme = ({setShowSideModal, setShowThemes, setData, setLoadListTheme}) => {
    const {customValues, setCustomValues} = useStore(null);
    const uploadRef = useRef();
    const [isSaving, setIsSaving] = useState(false);
    const colorOnChange = (e) => {
      setCustomValues({...customValues, color: e.target.value});
    }
    const onNameChange = (e) => {
      setCustomValues({...customValues, name: e.target.value});
    }
    const removeImage = (index) => {
          customValues.images.splice(index,1);
          setCustomValues && setCustomValues({...customValues});
    }
  
    const bgSizeOnChange = (value, index) => {
          customValues.images[index].size = value;
          setCustomValues && setCustomValues({...customValues});
      }
  
      const bgSizeCustomOnChange = (e, index) => {
          customValues.images[index].customSize = e.target.value;
          setCustomValues && setCustomValues({...customValues});
      }
  
      const bgRepeatOnchange = (value, index) => {
          customValues.images[index].repeat = value;
          setCustomValues && setCustomValues({...customValues});
      }
  
      const bgPositionOnChange = (value, index) => {
          customValues.images[index].position = value;
          setCustomValues && setCustomValues({...customValues});
      }
    
      const onChangeBackground = (e) => {
        const files = e.target.files;
        if (!files.length) return;
    
        const maxImages = 5;
        const maxSize = 1024 * 1024; // 1MB in bytes
    
        const totalImages = files.length + (customValues.images?.length || 0);
        if (totalImages > maxImages) {
          toast.error(`Maximum ${maxImages} images allowed!`);
          return;
        }
    
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
    
          if (file.size > maxSize) {
            toast.error(`Image "${file.name}" is larger than 1MB. Please choose a smaller image.`);
            continue;
          }
    
          const reader = new FileReader();
          reader.onload = () => {
            const obj = {
              url: reader.result,
              repeat: 'no-repeat',
              position: 'left top',
              size: 'auto',
            };
            customValues.images.push(obj);
            setCustomValues && setCustomValues({ ...customValues });
          };
          reader.readAsDataURL(file);
        }
      };

    const onSave = async () => {
      setIsSaving(true);
      try {
        let payload = customValues;
        if (customValues.images?.length) {
          const updatedImages = await Promise.all(
            customValues.images.map(async (image, index) => {
              const {url, key} = await uploadBase64ToR2(image.url, index, 'themes');
              return {
                ...image,
                url,
                key,
              };
            })
          );

          setCustomValues(prev => ({
            ...prev,
            images: updatedImages,
            coverImage: updatedImages[0]?.url,
          }));

          payload = {
            ...customValues,
            images: updatedImages,
            coverImage: updatedImages[0]?.url,
          };
        }
        
        const postTheme = await api.post(urls.NEW_THEME, payload);
        if (postTheme.data) {
          toast.success('Theme has been created successfully!');
          setShowSideModal(false);
          setShowThemes(true);
          setData((prev) => ({...prev, themeType: 'custom'}));
          setLoadListTheme(true);
        }

      } catch (err) {
        console.error('Upload or save failed', err);
        alert('Upload or save failed, please try again.');
      } finally {
        setIsSaving(false);
      }
    }

    return (
        <div className={classes.newTheme}>
            <h3>New theme</h3>
            <div>
              <div>
                <span>Name</span>
                <input type='text' onChange={onNameChange} value={customValues?.name || ''} />
              </div>
              <div>
                <span>Privacy</span>
                <RadioList
                    list={PRIVACY_DATA}
                    value={customValues.privacy || 'public'}
                    setValue={setCustomValues}
                    data={customValues}
                    datafield='privacy'
                    isVertical
                />
                {
                    customValues.privacy === 'shared' &&
                    <div>
                        <label>Share with (users)</label>
                        <SearchUsers users={customValues.shareWith || []} setUsers={setCustomValues} datafield='shareWith' />
                    </div>
                }
              </div>
              <div>
                  <span>Background color</span>
                  <input type="color" onChange={colorOnChange} value={customValues?.color || '#FFFFFF'}/>
              </div>
              <div>
                  <label>Background image</label>
                  <input type="file" ref={uploadRef} accept=".png,.jpg,.jpeg,.gif,.svg" onChange={onChangeBackground} multiple />

                  {(!customValues.images || customValues.images.length === 0) && (
                  <button onClick={() => uploadRef.current.click()} className="btn main2">Upload Images</button>
                  )}
                  {customValues.images?.length > 0 && (
                  <>
                      <div className={classes.imageList}>
                      {customValues.images.map((image, index) => (
                          <ThemeImageItem
                          key={`image-${index}`}
                          image={image}
                          index={index}
                          onRemove={removeImage}
                          onClick={() => uploadRef.current.click()}
                          onRepeatChange={bgRepeatOnchange}
                          onSizeChange={bgSizeOnChange}
                          onSizeCustomChange={bgSizeCustomOnChange}
                          onPositionChange={bgPositionOnChange}
                          />
                      ))}
                      </div>
                      {customValues.images.length < 5 && (
                      <button onClick={() => uploadRef.current.click()} className="btn sub">Add More Images</button>
                      )}
                  </>
                  )}
              </div>
            </div>
            <div className={classes.buttons}>
              <button disabled={!(customValues.name && (customValues.color !== '#ffffff' || customValues.images.length)) || isSaving} className={isSaving ? 'btn btn-loading': 'btn'} onClick={onSave}>
                {isSaving ? 'Saving' : 'Save theme'}
                {isSaving && <LoadingDots />}
              </button>
            </div>
        </div>
    )
}

export default NewTheme;