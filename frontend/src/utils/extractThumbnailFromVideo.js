export const extractThumbnailFromVideo = (videoFileOrUrl) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');

    video.src = typeof videoFileOrUrl === 'string' ? videoFileOrUrl : URL.createObjectURL(videoFileOrUrl);
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    video.onloadeddata = () => {
      video.currentTime = 0;
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return reject('Thumbnail capture failed');
        const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.9);
    };

    video.onerror = (err) => reject(err);
  });
};
