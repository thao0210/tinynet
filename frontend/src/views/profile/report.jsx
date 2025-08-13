import { useEffect, useState } from 'react';
import api from '@/services/api';
import urls from '@/sharedConstants/urls';
import Loader from '@/components/loader';
import classes from './styles.module.scss';
import { MdVisibility } from 'react-icons/md';
import Tippy from '@tippyjs/react';
import { RxUpdate } from "react-icons/rx";
import Dropdown from "@/components/dropdown";
import DOMPurify from 'dompurify';

const statusList = ['pending', 'reviewed', 'ignored', 'action_taken'];

const ReportsPage = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [reviewingReportId, setReviewingReportId] = useState(null);
  const [reviewContent, setReviewContent] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(urls.REPORTS_LIST);
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

    const handleUpdate = async (reportId) => {
        try {
        await api.put(`${urls.REPORT_UPDATE_STATUS}/${reportId}`, {
            status: newStatus,
            note,
        });
        setEditingReportId(null);
        setNote('');
        setNewStatus('');
        fetchReports(); // refresh list
        } catch (err) {
        console.error('Failed to update report', err);
        }
    };
    
    const openUpdate = (r) => {
            setEditingReportId(r._id);
            setNewStatus(r.status);
            setNote(r.note || '');
    }

    const handleReview = async (report) => {
        if (reviewingReportId === report._id) {
            // toggle off
            setReviewingReportId(null);
            setReviewContent(null);
            return;
        }

        setReviewingReportId(report._id);
        setLoadingReview(true);

        try {
            const res = await api.get(
            report.targetType === 'item'
                ? `${urls.LIST}/${report.targetId}`
                : `${urls.GET_COMMENT}/${report.targetId}`
            );
            setReviewContent(report.targetType === 'item' ? res.data?.item : res.data);
        } catch (err) {
            console.error('Failed to fetch review content', err);
            setReviewContent({ error: 'Could not load content' });
        } finally {
            setLoadingReview(false);
        }
    };
  return (
    <div className={classes.reports} id='reports'>
      <h2>Reports</h2>
      {!loading && reports.length === 0 &&
        <div className='noItem'>No reports available.</div>
      }
      {loading ? (
        <Loader isSmall />
      ) : (
        <ul className={classes.reportList}>
          {reports.length > 0 && reports.map((r) => (
            <li key={r._id}>
                <div>
                    <div>
                        <label>Type</label>
                        <strong>{r.targetType === 'item' ? 'post' : 'comment'}</strong>
                    </div>
                    <div>
                        <label>Status</label>
                        <strong>{r.status}</strong>
                    </div>
                    <div>
                        <label>By</label>
                        <strong>{r.reportedBy?.username}</strong>
                    </div>
                    <div className={classes.reason}>
                        <label>Reason</label>
                        <strong>{r.reason}</strong>
                    </div>
                    <div>
                        <label>Note</label>
                        <strong>{r.note || 'N/A'}</strong>
                    </div>
                    
                    {user.role === 'admin' && (
                            <div>
                                <Tippy content='Review this report'>
                                <span onClick={() => handleReview(r)} style={{ cursor: 'pointer' }}>
                                    <MdVisibility />
                                </span>
                                </Tippy>
                                {(reviewingReportId === r._id || r.status !== 'pending') && (
                                <Tippy content='Update status'>
                                    <span onClick={() => openUpdate(r)}>
                                        <RxUpdate />
                                    </span>
                                </Tippy>)
                                }
                            </div>
                        )
                    }
                </div>
              {user.role === 'admin' && (
                <>
                  {reviewingReportId === r._id && (
                    <div className={classes.below}>
                        <div className={classes.reviewBox}>
                        {loadingReview ? (
                            <Loader isSmall />
                        ) : reviewContent?.error ? (
                            <div className='error'>{reviewContent.error}</div>
                        ) : r.targetType === 'item' ? (
                            <>
                            <h4>{reviewContent.title}</h4>
                            <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(reviewContent.content)}} />
                            </>
                        ) : (
                            <>
                            <p><strong>Comment:</strong> {reviewContent.content}</p>
                            {reviewContent.postId && (
                                <p style={{ fontSize: 13 }}>In post ID: {reviewContent.postId}</p>
                            )}
                            </>
                        )}
                        </div>

                        {editingReportId === r._id && (
                        <div className={classes.status}>
                            <h4>Update status</h4>    
                            <div className={classes.flex}>
                                <Dropdown
                                  curValue={newStatus}
                                  list={statusList}
                                  onSelect={setNewStatus}
                                  width={120}
                                  name={'dotsOptions'}
                                  dropdownContainerSelector='#reports'
                                />
                                <input
                                type="text"
                                placeholder="Admin note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                style={{ marginLeft: 8 }}
                                />
                                <button className="btn" onClick={() => handleUpdate(r._id)} style={{ marginLeft: 8 }}>Save</button>
                                <button className='btn sub' onClick={() => setEditingReportId(null)} style={{ marginLeft: 4 }}>Cancel</button>
                            </div>
                        </div>
                        )}
                    </div>
                    )}

                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportsPage;
