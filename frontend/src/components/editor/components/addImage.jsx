import { useRef, useState } from "react";
import Compressor from 'compressorjs';
import { FaImage} from 'react-icons/fa';
import { MdOutlineRadioButtonUnchecked, MdOutlineRadioButtonChecked } from "react-icons/md";
import Tippy from "@tippyjs/react";
import Dropdown from "@/components/dropdown";
import classes from '../styles.module.scss';

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const AddImage = ({error, setError, editor}) => {
    const [imageOption, setImageOption] = useState('url');
    const imageRef = useRef();
    const processImageToBase64 = (file, callback) => {
      const handleResult = (resultBlob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          callback(reader.result); // base64 string
        };
        reader.readAsDataURL(resultBlob);
      };
    
      if (file.size > MAX_IMAGE_SIZE) {
        new Compressor(file, {
          quality: 0.6,
          success: handleResult,
          error: (err) => console.error("Compression failed:", err),
        });
      } else {
        handleResult(file); // không cần nén
      }
    };
    const checkImageExists = async (url) => {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          const contentType = response.headers.get('Content-Type');
      
          if (response.ok && contentType && contentType.startsWith('image/')) {
            return true;
          }
          throw new Error('Not an image');
        } catch (err) {
          throw new Error('Image does not exist or not accessible');
        }
      };

      const addImage = () => {
        setImageOption('upload');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg, image/webp';
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            processImageToBase64(file, (base64Url) => {
              editor.chain().focus().insertContent({
                type: 'image',
                attrs: {
                  src: base64Url,
                  width: 400,
                  align: 'left',
                  style: 'margin-left:20px; margin-right: 20px'
                }
              }
            ).run();
            });
            // setShowImageOptions(false);
          }
        };
        input.click();
      };
    const addImageFromUrl = async (e) => {
        const url = e.target.value.trim();
        if (!url) return;
    
        try {
          await checkImageExists(url);
          editor
            ?.chain()
            .focus()
            .setImage({ src: url})
            .run();
          setError(null);
          // setShowImageOptions(false);
        } catch (err) {
          setError('No image found from this url');
        }
      }
    return (
        <div ref={imageRef}>
          <Dropdown
            trigger={
            <Tippy content='Add image'>
              <span><FaImage /></span>
            </Tippy>}
            width={300}
            dropdownContainerSelector=".editor"
            stopPropagation
          >
            {({ onClose }) => (
            <ul className={classes.imageOptions}>
              <li onClick={() => {
                setImageOption('url')}}>
                {
                  imageOption === 'url' ? <MdOutlineRadioButtonChecked /> : <MdOutlineRadioButtonUnchecked />
                }
                <div>
                  <label>From Url</label>
                  <input type='text' placeholder="Paste image URL" onBlur={addImageFromUrl} />
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
                
              </li>
              <li onClick={() => {
                addImage();
                onClose();
                }}>
                {
                  imageOption === 'upload' ? <MdOutlineRadioButtonChecked /> : <MdOutlineRadioButtonUnchecked />
                }
                <label>Upload image</label>
              </li>
            </ul>)}
          </Dropdown>
        </div>
    )
}

export default AddImage;