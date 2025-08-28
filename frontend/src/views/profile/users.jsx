// src/components/AdminUsers/AdminUsers.jsx
import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import urls from "@/sharedConstants/urls";
import api from '@/services/api';
import Loader from '@/components/loader';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(urls.GET_USERS);
        const data = res.data;
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      <h2>Registered Users</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Stars</th>
            <th>Posts</th>
            <th>Comments</th>
            <th>Followers</th>
            <th>Followings</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u._id}>
              <td>{idx + 1}</td>
              <td><img src={u.avatar} alt="avatar" height={30} /> {u.name}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.userPoints}</td>
              <td>{u.noOfPosts}</td>
              <td>{u.noOfComments}</td>
              <td>{u.noOfFollowers}</td>
              <td>{u.noOfFollowings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
