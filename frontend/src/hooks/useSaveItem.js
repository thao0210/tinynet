// hooks/useSaveItem.js
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { uploadFileToR2, convertToFile, uploadBase64ToR2 } from '@/utils/file';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { itemStrategies } from '../utils/itemStragegies';
import { extractThumbnailFromVideo } from '../utils/extractThumbnailFromVideo';
import DOMPurify from 'dompurify';
import { generateSafeFileName, generateSafeFileNameFromBase64 } from '../utils/file';

export const useSaveItem = ({
  data,
  user,
  usePoint,
  curItemId,
  setShowModal,
  setLoadList,
  setCurItemId,
  setIsSaving,
  setLoadViewContent
}) => {
  const saveItem = useCallback(async () => {
    setIsSaving(true);
    let imageUrl = '';
    let updatedContent = '';
    let updatedTranslations = [];

    try {
      // === 📝 Story ===
      if (data.type === 'story') {
        const allContents = [{ lang: data.language, content: DOMPurify.sanitize(data.content) }, ...(data.translations || [])];

        const base64Map = new Map();
        allContents.forEach(({ content }) => {
          const matches = [...content.matchAll(/<(img|video)[^>]+src=["'](data:(image|video)\/[^"']+)["']/g)];
          matches.forEach(match => {
            const base64 = match[2];
            if (!base64Map.has(base64)) base64Map.set(base64, null);
          });
        });

        let idx = 0;
        for (let base64 of base64Map.keys()) {
          const name = generateSafeFileNameFromBase64(base64, `media-${idx}`);
          const { url } = await uploadBase64ToR2(base64, idx++, `stories`, name);
          base64Map.set(base64, url);
        }

        allContents.forEach(({ lang, content }) => {
          let updated = content;
          base64Map.forEach((url, base64) => {
            updated = updated.replaceAll(base64, url);
          });

          if (lang === data.language) {
            updatedContent = updated;
          } else {
            updatedTranslations.push({ lang, content: updated });
          }
        });

        if (data.uploadedMusicFile) {
          const name = generateSafeFileName(data.uploadedMusicFile?.name || 'music.mp3');
          const { url } = await uploadFileToR2(data.uploadedMusicFile, `stories/musics/${name}`);
          data.backgroundMusic = url;
        }
      }

      // === 🎨 Draco ===
      if (data.type === 'draco') {
        if (data.imageUrl && curItemId) {
          imageUrl = data.imageUrl;
        }
        if (data.base64) {
          const timestamp = Date.now();
          const file = convertToFile(data.base64, `${data.type}_${timestamp}.jpg`);
          const { url } = await uploadFileToR2(file, `dracos/${data.type}_${timestamp}.jpg`);
          if (url) imageUrl = url;
        }
      }

      // === 🃏 Card ===
      if (data.type === 'card' && data.cardDetails) {
        const clonedDetails = structuredClone(data.cardDetails); // Deep clone

        // 1. Upload music.file if exists
        if (clonedDetails.music?.file) {
          const { file } = clonedDetails.music;
          const name = generateSafeFileName(file.name || 'music.mp3');
          const { url } = await uploadFileToR2(file, `cards/musics/${name}`);
          clonedDetails.music.url = url;
          clonedDetails.music.file = null;
        }

        // 2. Upload any naturalSound with type: 'recorder' and file
        for (let sound of clonedDetails.naturalSounds || []) {
          if (sound.type === 'recorder' && sound.file) {
            const { file } = sound;
            console.log('Uploading recorder sound:', file, file.name);
            const name = generateSafeFileName(file.name || 'recorder.webm');
            console.log('Sound name:', name);
            const { url } = await uploadFileToR2(file, `cards/recorders/${name}`);
            sound.url = url;
            sound.file = null;
          }
        }

        // 3. Upload screen.background.file if exists
        for (let screen of clonedDetails.screens || []) {
          if (screen.background?.file) {
            const { file } = screen.background;
            const name = generateSafeFileName(file.name || 'background.jpg');
            const { url } = await uploadFileToR2(file, `cards/backgrounds${name}`);
            screen.background.url = url;
            screen.background.file = null;
          }
        }

        // === 📸 Xử lý thumbnailImage ===
        const firstScreen = clonedDetails.screens?.[0];
        let thumbnailImage = '';

        if (firstScreen?.background?.url) {
          if (firstScreen.background.type === 'video') {
            // Extract thumbnail from video
            const thumbFile = await extractThumbnailFromVideo(firstScreen.background.url);
            const name = generateSafeFileName(thumbFile.name || 'background.jpg');
            const { url: thumbUrl } = await uploadFileToR2(thumbFile, `cards/thumbnails/${name}`);
            thumbnailImage = thumbUrl;
          } else {
            // If it's image type, just reuse background.url
            thumbnailImage = firstScreen.background.url;
          }
        }

        data.cardDetails = clonedDetails;
        data.thumbnailImage = thumbnailImage;
      }

      // === 📦 Chuẩn bị data để lưu ===
      const clonedData = { ...data };
      if (updatedContent) clonedData.content = updatedContent;
      if (updatedTranslations.length) {
        clonedData.translations = clonedData.translations.map((t) => {
          const updated = updatedTranslations.find((ut) => ut.lang === t.lang);
          return updated ? { ...t, content: updated.content } : t;
        });
      }

      const _data = await itemStrategies(
        clonedData.type,
        clonedData,
        user,
        imageUrl,
        clonedData.content,
        usePoint
      );
      
      const jsonSizeInBytes = new TextEncoder().encode(JSON.stringify(_data)).length;
      const maxAllowedSize = 10 * 1024 * 1024;
      if (jsonSizeInBytes > maxAllowedSize) {
        toast.error("Content is too large, please reduce or optimize image.");
        setIsSaving(false);
        return;
      }

      const postItem = curItemId
        ? await api.put(`${urls.LIST}/${curItemId}`, _data)
        : await api.post(urls.NEW_ITEM, _data);

      if (postItem.data) {
        setShowModal(false);
        toast.success(`Post is successfully ${curItemId ? 'updated!' : 'created!'}`);
        setLoadList(true);
        setCurItemId(null);
        setLoadViewContent(true);
      }

    } catch (err) {
      console.error('Upload or save failed', err);
      alert('Upload or save failed, please try again.');
    } finally {
      setIsSaving(false);
    }

  }, [data, user, usePoint, curItemId, setShowModal, setLoadList, setCurItemId, setIsSaving, setLoadViewContent]);

  return { saveItem };
};
