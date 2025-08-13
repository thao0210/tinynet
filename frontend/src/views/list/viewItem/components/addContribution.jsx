import classes from '../styles.module.scss';
import TiptapEditor from '@/components/editor';
import { useEffect, useRef, useState } from 'react';
import { getActiveContent } from '@/utils/lang';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';

const AddContribution = ({ activeLang, item, curContributionId, setLoadViewContent, setShowContributionModal }) => {
  const [data, setData] = useState({
    lang: activeLang,
    content: '',
    text: '',
    theme: null
  });
  const contentRef = useRef(data.content);
  
  const updateActiveText = (newText) => {
    setData((prev) => {
      const updated = { ...prev };
      updated.text = newText;
      return updated;
    });
  };

  const onContentChange = (html) => {
        contentRef.current = DOMPurify.sanitize(html);
        setData((prev) => {
            const updated = { ...prev };
            updated.content = DOMPurify.sanitize(html);
            return updated;
        });
        
    };

    const onSave = async () => {
        try {
            const _data = {
                lang: data.lang,
                content: data.content,
                text: data.text,
                itemId: item._id
            }
            const save = curContributionId ? await api.put(`${urls.CONTRIBUTION}/${curContributionId}`, _data) : await api.post(`${urls.CONTRIBUTION}`, _data);
        if (save.data) {
            toast.success(`Your contribution has been ${curContributionId ? ' modified':' created'}`);
            setLoadViewContent(true);
            setShowContributionModal(false);
        }
        } catch (err) {

        }
    }

  useEffect(()=>{
    const loadCurrentData = async () => {
      try {
         const loadData = await api.get(`${urls.CONTRIBUTION}/${curContributionId}`);
         if (loadData.data) {
          setData(loadData.data);
         }
      } catch (err) {
        console.log(err);
      }
    }

    curContributionId && loadCurrentData();

  }, [curContributionId]);

  return (
    <div className={classes.post}>
      <div>
        <TiptapEditor
          setData={setData}
          data={data}
          content={getActiveContent(activeLang, data)?.content}
          onContentChange={onContentChange}
          onTextChange={updateActiveText}
          useSmallText={true}
          isContribution={true}
        />
      </div>
      <div className={classes.contributionBtns}>
        <button className='btn' onClick={onSave}>Save</button>
      </div>
    </div>
  );
};

export default AddContribution;