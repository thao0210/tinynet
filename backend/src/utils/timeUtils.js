function getStartOfWeekInUTC7() {
    const now = new Date();
    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const day = utc7.getUTCDay(); // 0 = Sunday
    const diff = utc7.getUTCDate() - day + (day === 0 ? -6 : 1); // về thứ 2
  
    const mondayUTC7 = new Date(utc7.setUTCDate(diff));
    mondayUTC7.setUTCHours(0, 0, 0, 0);
    return new Date(mondayUTC7.getTime() - 7 * 60 * 60 * 1000); // convert về UTC chuẩn
  }
  
  function getEndOfWeekInUTC7() {
    const start = getStartOfWeekInUTC7();
    return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1); // hết Chủ Nhật
  }
  
  function getNextResetTimeISO() {
    const endOfWeek = getEndOfWeekInUTC7();
    return new Date(endOfWeek.getTime() + 1).toISOString(); // Giây tiếp theo sau tuần
  }

  module.exports = {
    getStartOfWeekInUTC7, getEndOfWeekInUTC7, getNextResetTimeISO
  }