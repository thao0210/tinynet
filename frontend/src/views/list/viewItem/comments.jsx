import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import classes from './styles.module.scss';
import { useEffect, useRef, useState } from "react";
import { BsPersonCircle } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { formatDate } from "@/utils/numbers";
import ItemMenus from '@/components/itemMenu';
import { LikeIcon } from '@/components/listComponents/icons';
import { FaSmile } from 'react-icons/fa';
// import EmojiPicker from 'emoji-picker-react';
import { useStore } from '@/store/useStore';
import DOMPurify from 'dompurify';
import EmojiPickerLite from '@/components/emojiPicker';
import Dropdown from '@/components/dropdown';

const CommentItem = ({comment, setLoadComments, setComment, setCurCommentId, user, setShowModal}) => {
    const myComment = comment?.author && comment?.author?.username && (user?.username === comment?.author?.username);
    const isUser = user;
    const onEdit = () => {
        setComment(comment.content);
        setCurCommentId(comment._id);
    }

    const onDelete = async () => {
        const deleteComment = await api.delete(`${urls.LIST_COMMENTS}/${comment._id}`);
        if (deleteComment.data) {
            setLoadComments(true);
        }
    }

    const onReport = (e) => {
        e.stopPropagation();
        setShowModal('report-comment-' + comment._id);
    }
    return (
        <li>
            <div className={classes.avatar}>
                {
                    comment.author &&  comment.author.avatar ?
                    <img src={comment.author.avatar} height={25} /> : 
                    <BsPersonCircle size={25} />
                } 
            </div>
            <div className={classes.comment}>
                <div className={classes.topInfo}>
                    <strong>{comment.author && comment.author.fullName ? comment.author.fullName : comment.author.username}</strong>
                    <LikeIcon item={comment} isComment />
                    <ItemMenus
                        onDelete={onDelete}
                        onEdit={onEdit}
                        item={comment}
                        isMyPost={myComment}
                        onReport={onReport}
                        isUser={isUser}
                    />
                </div>
                <div className={classes.ccontent}>
                {comment.content}
                </div>
                <div className={classes.bottom}>
                    <span>{formatDate(comment.date)}</span>
                </div>
            </div>
            
        </li>
    )
}
const Comments = ({item, setShowComments}) => {
    const [commentsList, setCommentsList] = useState([]);
    const [loadComments, setLoadComments] = useState(true);
    const [comment, setComment] = useState('');
    const editorRef = useRef();
    const [curCommentId, setCurCommentId] = useState('');
    const {user, setShowModal} = useStore();

    const commentOnChange = () => {
        const safeHTML = DOMPurify.sanitize(editorRef.current.innerHTML);
        setComment(safeHTML);
    }

    const saveComment = async () => {
        const data = {
            content: comment,
            itemId: item._id
        }
        const save = curCommentId ? await api.put(`${urls.LIST_COMMENTS}/${curCommentId}`, data) : await api.post(`${urls.NEW_COMMENT}`, data);
        if (save.data) {
            setLoadComments(true);
        }
        setComment('');
        setCurCommentId('');
    }

    const getCommentsList = async () => {
        try {
            const getList = await api.get(`${urls.LIST_COMMENTS}/${item._id}`);
            if (getList.data) {
                setCommentsList(getList.data);
                setLoadComments(false);
            }
        } catch (error) {
            if (error.response) {
                setLoadComments(false);
            }
        }
    }

    const addEmoji = (emojiObject) => {
        setComment(comment + emojiObject);
      };

    useEffect(()=>{
        if (loadComments) {
            getCommentsList();
        }
    }, [loadComments]);

    return (
        <div className={classes.comments} id='comments'>
            <h2>Comments{
                    commentsList.length > 0 &&
                    <sup>{commentsList.length}</sup>
                }
                <span className={classes.close} onClick={() => setShowComments(false)}>&times;</span>
               </h2>
            { commentsList.length > 0 && 
                <ul className={classes.commentsList}>
                    {
                        commentsList.map((comment, index) => 
                        <CommentItem 
                            comment={comment} 
                            key={`comment-${index}`} 
                            setLoadComments={setLoadComments}
                            setComment={setComment}
                            setCurCommentId={setCurCommentId}
                            user={user}
                            setShowModal={setShowModal}
                        />)
                    }
                </ul>
            } 
            <div className={classes.newComment}>
                <div 
                    className={classes.editor} 
                    contentEditable  
                    onBlur={commentOnChange} 
                    placeholder="Add a comment"
                    dangerouslySetInnerHTML={{__html: comment}}
                    ref={editorRef}
                />
                <Dropdown
                    trigger={<FaSmile className={classes.emoji} />}
                    className={classes.emojiPicker}
                    dropdownContainerSelector='#comments'
                    tippy='Emoji Picker'
                >
                    <EmojiPickerLite onSelect={addEmoji} className={classes.emojiBox} />
                </Dropdown>
                <IoSend size={20} onClick={saveComment} className={classes.add}/>
            </div>
        </div>
    )
}

export default Comments;