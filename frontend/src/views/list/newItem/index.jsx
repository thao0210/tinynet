import { useEffect, useRef, useState } from 'react';
import classes from './styles.module.scss';
import { useStore } from '@/store/useStore';
import Post from './itemTypes/post';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import GeneralInfos from './itemTypes/general';
import ShareUrl from './itemTypes/shareUrl';
import Collection from './itemTypes/collection';
import Drawing from './itemTypes/drawing/index';
import Vote from './itemTypes/vote';
import {StarPoints} from '@/components/Utilities';
import { LoadingDots } from '@/components/loader';
import { LanguageModal, Title } from './itemTypes/generalComponents';
import Card from './itemTypes/card';
import { useSaveItem } from '@/hooks/useSaveItem';
import DOMPurify from 'dompurify';
import Tippy from '@tippyjs/react';
import { getNextError, getSaveError, isNextDisabled, isSaveDisabled } from '../../../utils/validators';

const NewItem = () => {
    const [type, setType] = useState(null);
    const {showModal, curItemId, setShowModal, setLoadList, setCurItemId, user, setLoadViewContent} = useStore();
    const [isNext, setIsNext] = useState(false);
    const [metaData, setMetaData] = useState(null);
    const [coloringImage, setColoringImage] = useState('');
    const [saveBgData, setSaveBgData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [usePoint, setUsePoint] = useState(null);
    const [showLanguage, setShowLanguage] = useState(false);
    const [newLang, setNewLang] = useState(navigator.language || navigator.userLanguage || 'en-US');
    const hasLoadedDataRef = useRef(false);
    const [data, setData] = useState({
        privacy: 'public',
        allowComments: true,
        password: '',
        sendOtp: false,
        showTitle: true,
        type: type || 'story',
        themeType: null,
        language: navigator.language || navigator.userLanguage || 'en-US',
        translations: []
    });
    const contentRef = useRef(data.content);
    const [activeLang, setActiveLang] = useState(data.language || "en-US");

    const { saveItem } = useSaveItem({
        data,
        user,
        usePoint,
        curItemId,
        setShowModal,
        setLoadList,
        setCurItemId,
        setIsSaving,
        setLoadViewContent
    });

    const handleEditorContentChange = (html) => {
        contentRef.current = DOMPurify.sanitize(html);

        setData((prev) => {
            const updated = { ...prev };

            if (activeLang === updated.language) {
                updated.content = DOMPurify.sanitize(html);
            } else {
                const newTranslations = [...(updated.translations || [])];
                const index = newTranslations.findIndex(t => t.lang === activeLang);
                if (index !== -1) {
                newTranslations[index] = {
                    ...newTranslations[index],
                    content: DOMPurify.sanitize(html)
                };
                    updated.translations = newTranslations;
                }
            }

            return updated;
        });
    };

    const [languages, setLanguages] = useState(() => {
        return [
            data.language,
            ...(data.translations?.map((t) => t.lang) || [])
        ].filter(Boolean);
    });

    useEffect(() => {
        const allLangs = [
            data.language,
            ...(data.translations?.map(t => t.lang) || [])
        ].filter(Boolean);

        setLanguages([...new Set(allLangs)]);
    }, [data]);

    useEffect(()=>{
        const arr = showModal.split('-');
        if (arr.length === 2) {
            setType(arr[1]);
            setData(prev => ({
                ...prev,
                type: arr[1],
                title: arr[1]
            }));
        }
    }, []);

    useEffect(()=>{
        if (curItemId && !hasLoadedDataRef.current) {
            const viewItemDetails = async () => {
                const getItemDetails = await api.get(`${urls.LIST}/${curItemId}?mode=edit`);
                if (getItemDetails.data && getItemDetails.data.item) {
                    setData(prev => ({
                        ...prev,
                        ...getItemDetails.data.item,
                        translations: getItemDetails.data.item.translations || prev.translations
                    }));
                    setType(getItemDetails.data.item.type);
                    hasLoadedDataRef.current = true;
                }
            };
            viewItemDetails();
        }
    }, [curItemId]);

    useEffect(()=>{
        if (!curItemId && type === 'story') {
            setShowLanguage(true);
        }
    }, [curItemId, type]);

    const onNext = () => {
        setIsNext(true);
    }

    console.log('data', data);
    return (
        <div className={classes.new}>
            {
                !isNext &&
                <div className={classes.form}>
                    {   
                        type === 'story' && 
                        <Post type={type} data={data} setData={setData} languages={languages} 
                        onContentChange={handleEditorContentChange}
                        activeLang={activeLang}
                        setActiveLang={setActiveLang}
                        />
                    }
                    {
                        type === 'card' &&
                        <Card data={data} setData={setData} />
                    }
                    {
                        type === 'shareUrl' &&
                        <ShareUrl data={data} setData={setData} metaData={metaData} setMetaData={setMetaData} />
                    }
                    {
                        type === 'collection' &&
                        <Collection data={data} setData={setData} curItemId={curItemId} />
                    }
                    {
                        type === 'drawing' &&
                        <Drawing data={data} setData={setData} isColoring={type === 'coloring'} onNext={onNext} setShowModal={setShowModal} coloringImage={coloringImage} setColoringImage={setColoringImage} curItemId={curItemId} saveBgData={saveBgData} setSaveBgData={setSaveBgData} />
                    }
                    {
                        type === 'vote' &&
                        <Vote data={data} setData={setData} curItemId={curItemId} />
                    }
                </div>
            }
            {
                isNext &&
                <>
                    <Title languages={languages} data={data} setData={setData} />
                    <GeneralInfos data={data} setData={setData} type={type} curItemId={curItemId} usePoint={usePoint} setUsePoint={setUsePoint} languages={languages} />
                </>
            }
            <div className={classes.buttons}>
                {!isNext && (
                    <Tippy
                        content={getNextError(type, data) || ''}
                        placement="top"
                        disabled={!isNextDisabled(type, data)}
                    >
                    <strong>
                        <button className="btn" disabled={isNextDisabled(type, data)} onClick={onNext}>
                        Next
                        </button>
                    </strong>
                    </Tippy>
                )}

                {isNext && (
                    <>
                    <button className="btn sub" onClick={() => setIsNext(false)}>
                        Back
                    </button>
                    <div className="btnRelative">
                        <Tippy
                            content={getSaveError(type, data, curItemId) || ''}
                            placement="top"
                            disabled={!isSaveDisabled(type, data, curItemId)}
                        >
                        <strong>
                            <button
                            onClick={saveItem}
                            disabled={isNextDisabled(type, data) || isSaveDisabled(type, data, curItemId) || isSaving}
                            className={isSaving ? 'btn btn-loading' : 'btn'}
                            >
                            {isSaving ? 'Saving' : 'Save'}
                            {isSaving && <LoadingDots />}
                            </button>
                        </strong>
                        </Tippy>

                        {usePoint > 0 && <StarPoints points={-usePoint} size={20} />}
                    </div>
                    </>
                )}
            </div>

            {
                showLanguage &&
                <LanguageModal
                    setShowLanguage={setShowLanguage}
                    setNewLang={setNewLang}
                    newLang={newLang}
                    setData={setData}
                />
            }
        </div>
    )
}

export default NewItem;