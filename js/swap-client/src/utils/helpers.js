export const SWAP_STATUS = ['', 'PENDING', 'Order Matched', 'Claimed', 'Committing', 'Completed'];

export const getStringFromDate = (date) => {
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return month[date.getMonth()] + ' ' + date.getDate() + ', ' + (date.getFullYear() - 2000);
}