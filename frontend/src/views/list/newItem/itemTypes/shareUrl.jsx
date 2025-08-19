import classes from '../styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { useStore } from '@/store/useStore';
import Loader from '@/components/loader';

const ShareUrl = ({data, setData, metaData, setMetaData}) => {
    const {loading, setLoading} = useStore();
    const handleUrlInput = (e) => {
        const url = e.target.value;
        // setInputUrl(url);
        setData({...data, url: url});
      
        if (url.startsWith("http")) {
          fetchMetadata(url);
        }
    };

    const fetchMetadata = async (url) => {
        try {
          setLoading(true);
          const res = await api.post(urls.GET_METADATA, {url}, { timeout: 10000 });
          if (res.data) {
            setMetaData(res.data.metadata);
            setData({...data, url, preview: JSON.stringify(res.data.metadata)});
          }
        } catch (error) {
          console.error("Error fetching metadata:", error);
        } finally {
          setLoading(false);
        }
    };

    return (
        <div className={classes.share}>
            <div>
                <label>Url</label>
                <input className={classes.text} type='text' value={data.url} onChange={handleUrlInput} />
                {
                  loading && <Loader />
                }
                {!loading && metaData && (
                    <div className="metadata-preview">
                      {
                        metaData.image && <img src={metaData.image} alt="Preview" />
                      }
                    <h3>{metaData.title}</h3>
                    <p>{metaData.description}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ShareUrl;