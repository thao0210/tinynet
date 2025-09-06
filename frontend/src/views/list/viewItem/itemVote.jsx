import classes from './styles.module.scss';
import { BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import Loader from '@/components/loader';

const ItemVote = ({item, isVoted, isTimeout, votes, setVotes, voteMode, disabled}) => {
    const voteItem = async () => {
        votes.some(el => el.id === item._id) ?
            setVotes(votes.filter(vote => vote.id !== item._id)) : 
            voteMode === 'only-one' ? setVotes([{id: item._id, name: item.title}]) : 
            setVotes([...votes, {
                id: item._id, name: item.title}]);
    }

    const isVoteDisabled =
        disabled ||
        isVoted ||
        (
            item.maxVoters === 0 &&
            item.voteReward > 0
        );
    return (
        <>
        {
            isTimeout ?
            <div className={classes.timeoutVotes}>{item.noOfVotes} <span>votes</span></div> : 
            <button className={classNames('btn', classes.voteBtn, {[classes.unVote]: votes.some(el => el.id === item._id)})} disabled={isVoteDisabled} onClick={voteItem}>
                {
                    votes.some(el => el.id === item._id) ? 
                    <BiSolidDownvote size={25} />:
                    <BiSolidUpvote size={25} />
                }
            </button>
        }
        </>)
}

export const VoteResults = ({id, authorId}) => {
    const [topVoted, setTopVoted] = useState(null);
    const [allVotes, setAllVotes] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadResults = async (id) => {
        const results = await api.get(`${urls.VOTE_ITEM}/${id}/results?userId=${authorId}`);
        if (results.data) {
            results.data.topVoted && setTopVoted(results.data.topVoted);
            results.data.allVotes && setAllVotes(results.data.allVotes);
            setLoading(false);
        }           
    }

    useEffect(()=> {
        const firstViewResults = localStorage.getItem('firstViewResults-'+id);
        if (id) {
            setLoading(true);
            if (!firstViewResults) {
                setTimeout(() => {
                    loadResults(id);
                    localStorage.setItem('firstViewResults-'+id, true);
            }, 5000);
            } else {
                loadResults(id);
            }
        }
    }, []);

    return (
        <div className={classes.voteResults}>
            <h3>Top Voted</h3>
            <div>
                {
                    loading && 
                    <Loader />
                }
                {
                    topVoted && !loading && topVoted.noOfVotes > 0 &&
                    <div className={classNames(classes.item, classes.winner)}>
                        <h4>{topVoted.item && topVoted.item.title}</h4>
                        <div>
                            <strong>{topVoted.noOfVotes}</strong>
                            <span>Votes</span>
                        </div>
                    </div>
                }
                {
                    topVoted && !loading && topVoted.noOfVotes === 0 &&
                    <p>No vote available.</p>
                }
            </div>
        </div>
    )
}
export default ItemVote;