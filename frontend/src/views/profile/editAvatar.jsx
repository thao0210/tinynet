import { useState } from "react";
import { MdClose } from "react-icons/md";
import classes from './styles.module.scss';
import AvatarEditor from 'react-avatar-editor';
import urls from "@/sharedConstants/urls";
import { useStore } from "@/store/useStore";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import api from '@/services/api';
import toast from "react-hot-toast";
import { uploadFileToR2, deleteFileFromR2 } from "@/utils/file";
import { useNavigate } from "react-router-dom";

const EditAvatar = () => {
    const [file, setFile] = useState('');
    const [tab, setTab] = useState('select');
    const [image, setImage] = useState();
    const {user, setUser, setShowModal, setLoadList} = useStore();
    const navigate = useNavigate();
    const [scale, setScale] = useState(1);
    const {t} = useTranslation();
    const baseUrl = import.meta.env.VITE_R2_BASE_URL;
    const filesOnChange = (e) => {
        if (e.target.files.length > 0) {
            setImage(e.target.files[0]);
            const reader = new FileReader();
                reader.addEventListener("load", () => {
                    const result = reader.result;
                    setFile(result);
                });
                reader.readAsDataURL(e.target.files[0]);
        }
    }

    const deleteFile = () => {
        setFile('');
    }

    const changeTab = (value) => {
        setFile('');
        setTab(value);
    }

    const setEditorRef = (editor) => setImage(editor);

    const savePicture = (url) => {
        if (tab === 'upload') {
            if (image) {
                const canvasScaled = image.getImageScaledToCanvas();
                canvasScaled.toBlob(async function (blob) {
                    const fileName = `avatars/${user._id}.jpg`;
                    const file = new File([blob], fileName, { type: "image/jpeg" });

                    if (user.avatar && user.avatar.includes('upload.tinynet.net')) {
                        try {
                            const oldUrl = new URL(user.avatar);
                            const oldKey = oldUrl.pathname.substring(1);
                            await deleteFileFromR2(oldKey);
                        } catch (err) {
                            console.warn("Failed to delete old avatar:", err);
                        }
                    }  
                    
                    const {url, date} = await uploadFileToR2(file, fileName);
                    if (url && date) {
                        setUser({ ...user, avatar: url, avatarDate: date });
                        updateProfile(url, date);
                    }
                },"image/jpeg", 0.8);
            }
        } else {
            if (url) {
                updateProfile(url);
                setUser({...user, avatar: url});
            }
        }
        setLoadList(true);
    }

    const updateProfile = async(avatarUrl, date) => {
        const postProfile = await api.put(urls.UPDATE_AVATAR, {avatar: avatarUrl});
        if (postProfile.data) {
            setUser({...user, avatar: avatarUrl, avatarDate: date || null});
            toast.success('Avatar is updated successfully!');
            navigate('/profile/' + user._id);
        }
    }

    const onChoose = (url) => {
        savePicture(url);
        navigate('/profile/' + user._id);
    }

    const onZoom = (type) => {
        if (type === 'out' && scale > 0.2) {
            setScale(scale - 0.1);
        }
        if (type === 'in' && scale > 0) {
            setScale(scale + 0.1);
        }
    }

    return (
            <div className={classes.editAvatar}>
                {/* <h2>Change Avatar</h2> */}
                <div className={classes.select}>
                    <span className={tab === 'select' ? classes.active : ''} onClick={()=>changeTab('select')}>Select from available avatars</span>
                    <span className={tab === 'upload' ? classes.active : ''} onClick={()=>changeTab('upload')}>Upload</span>
                </div>
                {
                    tab === 'upload' &&
                    <>
                    <div className={classes.upload}>
                        {
                            file &&
                            <span>
                                <AvatarEditor
                                    image={file} 
                                    width={300}
                                    height={300}
                                    border={50}
                                    color={[255, 255, 255, 0.85]} // RGBA
                                    scale={scale}
                                    // rotate={rotate}
                                    ref={setEditorRef}
                                />
                                <MdClose onClick={deleteFile} />
                            </span>
                        }
                        {
                            file &&
                            <div className={classes.zoom}>
                                <AiOutlineZoomIn onClick={() => onZoom('in')} />
                                <AiOutlineZoomOut onClick={() => onZoom('out')} />
                            </div>
                        }
                        {
                            !file && 
                            <>
                                <span>Upload an image here</span>
                                <input type="file" accept=".png,.jpg,.jpeg" onChange={filesOnChange}/>
                            </>
                        }
                    </div>
                    <div className="buttons center">
                        <button className="btn" onClick={savePicture} disabled={!file}>Upload</button>
                    </div>
                    </>
                }
                {
                    tab === 'select' &&
                    <ul className={classes.avatars}>
                        {Array.from(Array(40)).map((item, index) =>
                            <li key={`ava${index}`} onClick={() => onChoose(`${baseUrl}/avatar/${index+1}.webp`)}
                                className={file === `${baseUrl}/avatar/${index+1}.webp` ? classes.active : ''}
                            >
                                <img src={`${baseUrl}/avatar/${index+1}.webp`} />
                            </li>
                        )}
                    </ul>
                }
            </div>
    )
}

export default EditAvatar;