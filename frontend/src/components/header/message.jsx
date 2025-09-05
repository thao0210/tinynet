import { useEffect, useRef, useState } from "react";
import classes from './styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import Modal from '@/components/modal';
import SearchUsers from "../searchUsers";
import Tippy from "@tippyjs/react";
import Dropdown from '@/components/dropdown';
import Pagination from '@/components/pagination';
import { IoMdCheckboxOutline } from 'react-icons/io';
import { MdCheckBoxOutlineBlank, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { formatMessageContent } from "@/utils/formatMessageContent";
import { formatDate } from "@/utils/numbers";

const SendMessageForm = ({ onSuccess, onClose }) => {
    const [selectedUser, setSelectedUser] = useState(''); // Lưu ý: array, nhưng chỉ chọn 1
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!selectedUser) return;
        setLoading(true);
        const res = await api.post(urls.MESSAGE, {
            receiverId: selectedUser, // chỉ gửi đến 1 người
            text,
            content: text
        });
        if (res.data) {
            setText('');
            setSelectedUser('');
            onSuccess?.();
            onClose?.();
        }
        setLoading(false);
    };

    return (
        <div className={classes.sendForm}>
            <div>
                <label>To</label>
                <SearchUsers 
                    users={selectedUser} 
                    setUsers={setSelectedUser} 
                    onlyOne={true} 
                />
            </div>
            
            <div>
                <label>Message</label>
                <textarea
                    placeholder="Enter message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>
            

            <button className="btn" onClick={sendMessage} disabled={loading || !selectedUser}>
                {loading ? 'Sending...' : 'Send'}
            </button>
        </div>
    );
};

const MesItem = ({ message, type, checkedAll, setSelectedIds}) => {
    const [isChecked, setIsChecked] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const shortText = message.text?.slice(0, 30) + (message.text?.length > 30 ? '...' : '');
    const onCheck = (e) => {
        e.stopPropagation();
        setIsChecked(!isChecked);
    }

    useEffect(()=>{
        setIsChecked(checkedAll === type);
    }, [checkedAll, type]);

    useEffect(() => {
        setSelectedIds(prev => {
            if (isChecked) {
            if (!prev.includes(message._id)) {
                return [...prev, message._id];
            }
            return prev;
            } else {
            return prev.filter(id => id !== message._id);
            }
        });
        }, [isChecked, message._id]);

    return (
        <li className={classes.messageItem} style={{display: expanded ? 'block' : 'flex'}} onClick={() => setExpanded(!expanded)}>
            <div className={classes.meta}>
                <span onClick={onCheck}>
                {isChecked ? <IoMdCheckboxOutline /> : <MdCheckBoxOutlineBlank />}
                </span>
                {type === 'sent' ? 'To: ' : 'From: '} 
                <div>
                    <img src={type === 'sent' ? message.receiver?.avatar : message.sender?.avatar} alt="avatar" width={25} />
                    <div>
                        <strong>{type === 'sent' ? message.receiver?.fullName || message.receiver?.username : message.sender?.fullName || message.sender?.username}</strong>
                        <span>{formatDate(message.createdAt)}</span>
                    </div>
                </div>
            </div>
            <div 
                className={classes.text} 
                style={{borderTop: expanded ? '1px solid #00000050' : 'none', marginTop: expanded ? '10px' : 0}}
                dangerouslySetInnerHTML={{__html: expanded ? formatMessageContent(message.content) : shortText}}
            />
        </li>
    );
};

const Message = () => {
    const [noOfMes, setNoOfMes] = useState(0);
    const [mesList, setMesList] = useState([]);
    const [showMesList, setShowMesList] = useState(false);
    const [reloadList, setReloadList] = useState(false);
    const [activeTab, setActiveTab] = useState('inbox');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [total, setTotal] = useState(0);
    const [checkedAll, setCheckedAll] = useState(''); 
    const [selectedIds, setSelectedIds] = useState([]);
    const tabs = ['inbox', 'sent'];

    const getList = async () => {
        try {
            const res = await api.get(`${urls.MESSAGE}/${activeTab}?page=${currentPage}&limit=10`);
            if (res.data) {
            setMesList(res.data.messages);
            setPageCount(res.data.pagination.pageCount);
            setTotal(res.data.pagination.total);
            setReloadList(false);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
     };

    const onDelete = async () => {
        try {   
            const confirm = window.confirm("Are you sure you want to delete these messages?");
            if (confirm) {
                const deleteItems = await api.delete(`${urls.MESSAGE}`, {data: { ids: selectedIds }});
                if (deleteItems.data) {
                    toast.success('Delete messages successfully!');
                    getList();
                }
            }
        } catch (err) {
            console.error('Error deleting messages:', err);
        }
    }
    const showMessage = async () => {
        setShowMesList(true);
        getList();
    }

    const onNotiIconClick = async () => {
        const resetCount = await api.post(urls.MESSAGE_RESET);
        if (resetCount.data) {
            setNoOfMes(0);
            showMessage();
        }
    }

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setReloadList(true);
    };

    const onCheckAllClick = (e, activeTab) => {
        e.stopPropagation();
        if (checkedAll === activeTab) {
            setCheckedAll('');
        } else {
            setCheckedAll(activeTab);
        }
    }
    useEffect(() => {
        const countMes = async () => {
            const count = await api.get(`${urls.MESSAGE_COUNT}`);
            if (count.data) setNoOfMes(count.data.count);
        };

        countMes();
        const interval = setInterval(countMes, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        reloadList && getList();
    }, [reloadList]);

    useEffect(() => {
        setCurrentPage(1); // reset về page 1 khi đổi tab
        getList();
    }, [activeTab]);

    return (
        <div className={classes.notifications}>
            <Tippy content="Messages">
            <div className={classes.icon} onClick={onNotiIconClick}>
                <img src="/message.svg" alt="Messages" height={28} />
                {noOfMes > 0 && <span>{noOfMes}</span>}
            </div>
            </Tippy>
            {showMesList && (
                <Modal setShowModal={setShowMesList} width={600}>
                    <div className={classes.mesList} id="message-box">
                        <div className={classes.header}>
                            <h2>Messages
                                <Dropdown
                                    trigger={<Tippy content='New message'>
                                                <button className={classes.addBtn}>+</button>
                                            </Tippy>}
                                    dropdownContainerSelector='#message-box'
                                    width={350}
                                >
                                    {({ onClose }) => (
                                        <SendMessageForm 
                                            onSuccess={() => {
                                                setReloadList(true);
                                            }} 
                                            onClose={onClose}
                                        />  
                                        )}
                                </Dropdown>
                                {
                                    selectedIds.length > 0 &&
                                    <Tippy content='Delete message(s)'>
                                        <button className={classes.addBtn} onClick={onDelete}><MdDelete size={20} /></button>
                                    </Tippy>
                                }
                            </h2>
                        </div>

                        <div className={classes.tabs}>
                            {tabs.map((tab) => (
                                <div
                                    key={tab}
                                    className={activeTab === tab ? classes.active : ''}
                                    onClick={() => {
                                    setActiveTab(tab);
                                    setReloadList(true);
                                    }}
                                >
                                    <span className={activeTab !== tab ? classes.disabled : ''} onClick={(e) => onCheckAllClick(e, tab)}>
                                    {checkedAll === tab ? <IoMdCheckboxOutline /> : <MdCheckBoxOutlineBlank />}
                                    </span>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </div>
                                ))
                            }
                        </div>

                        {mesList.length === 0 && <div className="noContent">No messages found.</div>}
                        {mesList.length > 0 && (
                            <>
                                <ul className={classes.mesListContent}>
                                {mesList.map((message) => (
                                    <MesItem 
                                        key={message._id} 
                                        message={message} 
                                        type={activeTab} 
                                        checkedAll={checkedAll}
                                        setSelectedIds={setSelectedIds}
                                    />
                                ))}
                                </ul>
                                <Pagination
                                currentPage={currentPage}
                                pageCount={pageCount}
                                onPageChange={handlePageChange}
                                total={total}
                                />
                            </>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Message;