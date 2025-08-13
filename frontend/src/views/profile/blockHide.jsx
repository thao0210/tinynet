import { useEffect, useState } from "react";
import api from "@/services/api";
import urls from "@/sharedConstants/urls";
import classes from "./styles.module.scss";
import { toast } from "react-hot-toast";
import Loader from '@/components/loader';
import { useStore } from '@/store/useStore';

const BlockHide = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [hiddenAuthors, setHiddenAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const {setLoadList} = useStore();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [blocked, items, authors] = await Promise.all([
        api.get(urls.BLOCKED_USERS),
        api.get(urls.HIDDEN_ITEMS),
        api.get(urls.HIDDEN_USERS),
      ]);

      setBlockedUsers(blocked.data || []);
      setHiddenItems(items.data || []);
      setHiddenAuthors(authors.data || []);
    } catch (err) {
      toast.error("Failed to load hidden/blocked data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await api.post(`${urls.UNBLOCK_USER}/${userId}`);
      setBlockedUsers(prev => prev.filter(u => u._id !== userId));
      toast.success("User unblocked");
      setLoadList(true);
    } catch (err) {
      toast.error("Failed to unblock");
    }
  };

  const handleUnhideItem = async (itemId) => {
    try {
      await api.post(`${urls.UNHIDE_ITEM}/${itemId}`);
      setHiddenItems(prev => prev.filter(i => i._id !== itemId));
      toast.success("Post unhidden");
      setLoadList(true);
    } catch (err) {
      toast.error("Failed to unhide post");
    }
  };

  const handleUnhideAuthor = async (authorId) => {
    try {
      await api.post(`${urls.UNHIDE_AUTHOR}/${authorId}`);
      setHiddenAuthors(prev => prev.filter(u => u._id !== authorId));
      toast.success("Author unhidden");
      setLoadList(true);
    } catch (err) {
      toast.error("Failed to unhide author");
    }
  };

  if (loading) return <Loader isSmall />;

  return (
    <div className={classes.blockHide}>
      <h4>Blocked Users</h4>
      <div className={classes.list}>
        {blockedUsers.length === 0 ? (
          <p className="noItem">No blocked users</p>
        ) : blockedUsers.map(user => (
          <div key={user._id} className={classes.item}>
            <span>{user.fullName || user.username}</span>
            <button onClick={() => handleUnblock(user._id)} className={'btn sub'}>Unblock</button>
          </div>
        ))}
      </div>

      <h4>Hidden Posts</h4>
      <div className={classes.list}>
        {hiddenItems.length === 0 ? (
          <p className="noItem">No hidden posts</p>
        ) : hiddenItems.map(item => (
          <div key={item._id} className={classes.item}>
            <span>{item.title}</span>
            <span>{item.author?.fullName || item.author?.username}</span>
            <button onClick={() => handleUnhideItem(item._id)} className={'btn sub'}>Unhide</button>
          </div>
        ))}
      </div>

      <h4>Hidden Authors</h4>
      <div className={classes.list}>
        {hiddenAuthors.length === 0 ? (
          <p className="noItem">No hidden authors</p>
        ) : hiddenAuthors.map(user => (
          <div key={user._id} className={classes.item}>
            <span>{user.fullName || user.username}</span>
            <button onClick={() => handleUnhideAuthor(user._id)} className={'btn sub'}>Unhide</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockHide;

