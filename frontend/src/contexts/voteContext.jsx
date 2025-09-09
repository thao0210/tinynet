// contexts/VoteContext.js
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/services/api";
import urls from "@/sharedConstants/urls";

const VoteContext = createContext();

export const VoteProvider = ({ children, initialConfig }) => {
  const [votes, setVotes] = useState([]);
  const [disabled, setDisabled] = useState(initialConfig?.disabled || false);
  const [isTimeout, setIsTimeout] = useState(initialConfig?.isTimeout || false);
  const [voteMode, setVoteMode] = useState(initialConfig?.voteMode || "only-one");

  useEffect(() => {
    if (initialConfig?.deadline) {
      setIsTimeout(false);       // cho phép vote lại nếu còn thời gian
      setDisabled(false);        // reset nút disabled
    }
  }, [initialConfig?.deadline]);

  const callVote = useCallback(async (user, parentId, votes) => {
    if (!user) return;

    try {
      const res = await api.post(`${urls.VOTE_ITEM}/${parentId}`, {
        userId: user._id,
        votedItemId: votes.map((el) => el.id),
      });

      if (res.data) {
        toast.success("Vote successfully!");
        setDisabled(true);
      }
    } catch (err) {
      toast.error("Vote failed");
      console.error(err);
    }
  }, []);
  return (
    <VoteContext.Provider
      value={{ votes, setVotes, disabled, setDisabled, isTimeout, setIsTimeout, voteMode, setVoteMode, callVote }}
    >
      {children}
    </VoteContext.Provider>
  );
};

export const useVote = () => useContext(VoteContext);
