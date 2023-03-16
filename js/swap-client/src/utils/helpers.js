export const SWAP_STATUS = [
  'Submitting order', 
  'Finding match', 
  'Order matched', 
  'Finalizing order', 
  'Completed'
];

export const getStringFromDate = (date) => {
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return month[date.month] + ' ' + date.day + ', ' + (date.year - 2000);
}

export const hashSecret = async function hash(bytes) {
	const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
	console.log('hashBuffer', hashBuffer)
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	console.log('hashArray', hashArray)
	const hashHex = hashArray
		.map(bytes => bytes.toString(16).padStart(2, '0'))
		.join('');
	console.log('hashHex', hashHex);
	return hashHex;
}

export const toWei = (num) => { return num * 1000000000000000000 }
export const fromWei = (num) => { return num / 1000000000000000000 }
export const toSats = (num) => { return num * 100000000 }
export const fromSats = (num) => { return num / 100000000 }

export const log = (message, obj, debug = true) => {
	if (debug) {
		console.log(message + " (SwapCreate)")
	 console.log(obj)
	}
};