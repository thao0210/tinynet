import { useVote } from "../contexts/voteContext";

export function useVoteItem(item, user) {
  const { votes, setVotes, isTimeout, voteMode, disabled } = useVote();

  const isSelected = votes.some(v => v.id === item._id);
  const isVoteDisabled =
    isTimeout ||
    disabled ||
    (voteMode === "only-one" && votes.length > 0 && !isSelected) ||
    (item.votedUsers?.includes(user?._id)) ||
    (item.maxVoters === 0 && item.voteReward > 0);

  const toggleVote = () => {
    if (isVoteDisabled) return;
    if (isSelected) {
      setVotes(votes.filter(v => v.id !== item._id));
    } else if (voteMode === "only-one") {
      setVotes([{ id: item._id, name: item.title }]);
    } else {
      setVotes([...votes, { id: item._id, name: item.title }]);
    }
  };

  return { isSelected, isVoteDisabled, toggleVote };
}
