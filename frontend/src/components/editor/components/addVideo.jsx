import { useRef, useState } from "react";
import { FaVideo } from 'react-icons/fa';
import { MdOutlineRadioButtonUnchecked, MdOutlineRadioButtonChecked, MdFiberManualRecord } from "react-icons/md";
// import ffmpeg from 'ffmpeg.js';
import Tippy from "@tippyjs/react";
import Dropdown from "@/components/dropdown";
import classes from '../styles.module.scss';

const MAX_VIDEO_SIZE = 5 * 1024 * 1024; // 5MB

const AddVideo = ({editor, error, setError}) => {
    const [videoOption, setVideoOption] = useState('url');
    const videoRef = useRef();

    const checkVideoExists = (url) => {
        return new Promise((resolve, reject) => {
          const video = document.createElement('video');
          video.onloadedmetadata = () => resolve(true);
          video.onerror = () => reject(new Error('Video not found'));
          video.src = url;
        });
      };

    const addVideoFromUrl = async (e) => {
        const url = e.target.value.trim();
        if (!url) return;
    
        try {
          await checkVideoExists(url);
          editor
            ?.chain()
            .focus()
            .insertContent(`<video src="${url}" controls></video>`);
          setError(null);
        } catch (err) {
          setError('No video found from this url.');
        }
      }
      const processVideoToBase64 = async (file, callback) => {
        const toBase64 = (blob) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
      
        // if (file.size > MAX_VIDEO_SIZE) {
        //   const arrayBuffer = await file.arrayBuffer();
        //   const result = await ffmpeg({
        //     MEMFS: [{ name: 'input.mp4', data: new Uint8Array(arrayBuffer) }],
        //     arguments: ['-i', 'input.mp4', '-b:v', '500k', '-preset', 'fast', 'output.mp4'],
        //   });
      
        //   const outputFile = result.MEMFS[0];
        //   const compressedBlob = new Blob([outputFile.data], { type: 'video/mp4' });
      
        //   const base64 = await toBase64(compressedBlob);
        //   callback(base64);
        // } else {
        //   const base64 = await toBase64(file);
        //   callback(base64);
        // }
          const base64 = await toBase64(file);
          callback(base64);
      };

      const addVideo = () => {
        setVideoOption('upload');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';

        input.onchange = async (event) => {
          const file = event.target.files[0];
          if (file) {
            await processVideoToBase64(file, (base64Url) => {
              editor.chain().focus().insertContent({
                type: 'video',
                attrs: {
                  src: base64Url,
                  controls: true,
                  style: 'max-width:500px;width:100%;height:auto;',
                }
              }).run();
            });
          }
        };
      
        input.click();
      };
    return (
        <div ref={videoRef}>
          <Dropdown
            trigger={
            <Tippy content='Add video'>
              <span><FaVideo /></span>
            </Tippy>}
            width={300}
            dropdownContainerSelector=".editor"
            stopPropagation
          >
            <ul className={classes.imageOptions}>
              <li onClick={() => {
                setVideoOption('url');
              }
                }>
                {
                    videoOption === 'url' ? <MdOutlineRadioButtonChecked /> : <MdOutlineRadioButtonUnchecked />
                }
                <div>
                    <label>From Url</label>
                    <input type='text' onBlur={addVideoFromUrl} placeholder="Paste video URL" />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
                </li>
                <li onClick={addVideo} className="disabled">
                {
                    videoOption === 'upload' ? <MdOutlineRadioButtonChecked /> : <MdOutlineRadioButtonUnchecked />
                }
                <label>Upload</label>
              </li>
            </ul>
          </Dropdown>
        </div>
    )
}

export default AddVideo;