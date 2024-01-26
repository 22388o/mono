export const SWAP_STATUS = [
  'Submitting order',
  'Finding match',
  'Swap matched',
  'Holder Invoice Created',
  'Holder Invoice Sent',
  'Seeker Invoice Created',
  'Seeker Invoice Sent',
  'Holder Invoice Paid',
  'Seeker Invoice Paid',
  'Holder Invoice Settled',
  'Seeker Invoice Settled',
  'Completed'
];

export const getStringFromDate = (date) => {
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return month[date.month] + ' ' + date.day + ', ' + (date.year - 2000)
}

export const hashSecret = async function hash (bytes) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  console.log('hashBuffer', hashBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  console.log('hashArray', hashArray)
  const hashHex = hashArray
    .map(bytes => bytes.toString(16).padStart(2, '0'))
    .join('')
  console.log('hashHex', hashHex)
  return hashHex
}

export const log = (message, obj, title = 'SwapCreate') => {
  console.log(message + ` (${title})`)
  if (obj) console.log(obj)
}

export function formatNumber(num) {
  const numStr = num.toString();
  const arr = numStr.split('.');
  const numArr = arr[0].split('');
  numArr.reverse();

  for (let i = 3; i < numArr.length; i += 4) {
    numArr.splice(i, 0, ',');
  }
  const formattedNum = numArr.reverse().join('');
  
  if(arr.length === 1) return formattedNum;
  return [formattedNum, arr[1]].join('.');
}