export const SWAP_STATUS = ['', 'PENDING', 'Order Matched', 'Pending Commits', 'Pending Final Commit', 'Completed'];

export const getStringFromDate = (date) => {
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return month[date.month] + ' ' + date.day + ', ' + (date.year - 2000);
}
