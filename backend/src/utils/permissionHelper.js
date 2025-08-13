// utils/permissionHelper.js
async function isBlocked(senderId, receiverId) {
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);
  return receiver.blockedUsers.includes(senderId);
}
