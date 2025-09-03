import React, {useState} from "react";
import styles from "./styles.module.scss";
import Loader from '../loader';

const getEmbedUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    // YouTube
    if (parsedUrl.hostname.includes("youtube.com") || parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // TikTok
    if (parsedUrl.hostname.includes("tiktok.com")) {
      return `https://www.tiktok.com/embed${parsedUrl.pathname}`;
    }

    // Facebook Video
    if (parsedUrl.hostname.includes("facebook.com")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=500`;
    }

    // Instagram
    if (parsedUrl.hostname.includes("instagram.com")) {
      return `https://www.instagram.com/p${parsedUrl.pathname}/embed`;
    }

    // Twitter
    if (parsedUrl.hostname.includes("twitter.com")) {
      return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
    }

    return null;
  } catch (e) {
    console.error("Invalid URL:", url);
    return null;
  }
};

const Embed = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) return <p className={styles.error}>Unsupported or invalid URL</p>;

  return (
    <div className={styles.embedWrapper}>
      {loading && (
        <Loader />
      )}
      <iframe
        src={embedUrl}
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title="Embedded content"
        onLoad={() => setLoading(false)}
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
};

export default Embed;
