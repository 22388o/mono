import {Buffer} from 'buffer';

export const fetchSwapCreate = async ({baseQuantity, quoteQuantity, participant}) => {
	console.log({participant});
	return await fetch('/api/v1/swap/create', {
		method: 'POST',
		headers: { 
			accept: 'application/json',
			'accept-encoding': 'application/json',
			authorization: `Basic ${Buffer.from(`${participant.left.client}:${participant.left.client}`).toString('base64')}`,
			'content-type': 'application/json',
			// 'content-length': Buffer.byteLength(buf),
			'content-encoding': 'identity'
		},
		body: JSON.stringify({
			makerOrderProps: {
				uid: 'uid1',
				hash: 'ignored',
				side: 'ask',
				type: 'limit',
				baseAsset: 'BTC',
				baseNetwork: 'lightning.btc',
				baseQuantity: baseQuantity,
				quoteAsset: 'ETH',
				quoteNetwork: 'goerli',
				quoteQuantity: quoteQuantity
			},
			takerOrderProps: {
				uid: 'uid0',
				hash: 'ignored',
				side: 'bid',
				type: 'limit',
				baseAsset: 'BTC',
				baseNetwork: 'lightning.btc',
				baseQuantity: baseQuantity,
				quoteAsset: 'ETH',
				quoteNetwork: 'goerli',
				quoteQuantity: quoteQuantity
			}
		})
	});
};
export const createLimitOrder = async ({baseAsset, baseNetwork, baseQuantity, quoteAsset, quoteNetwork, quoteQuantity, hash = 'ignored', uid}) => {
	let side = hash == null ? 'bid' : 'ask';
	return await fetch('/api/v1/orderbook/limit', {
		method: 'POST',
		headers: { 
			accept: 'application/json',
			'accept-encoding': 'application/json',
			authorization: `Basic ${Buffer.from(`${uid}:${uid}`).toString('base64')}`,
			'content-type': 'application/json',
			// 'content-length': Buffer.byteLength(buf),
			'content-encoding': 'identity'
		},
		body: JSON.stringify({
			makerOrderProps: {
				// uid: 'uid1',
				side: side,
				hash: hash,
				// type: 'limit',
				baseAsset: baseAsset,
				baseNetwork: baseNetwork,
				baseQuantity: baseQuantity,
				quoteAsset: quoteAsset,
				quoteNetwork: quoteNetwork,
				quoteQuantity: quoteQuantity
			}
		})
	});
};

export const openSwap = async ({participant, swapId, id, secret}) => {
	// const buf = (data && JSON.stringify(data)) || ''
	return await fetch('/api/v1/swap', {
		method: 'PUT',
		headers: { 
			accept: 'application/json',
			'accept-encoding': 'application/json',
			authorization: `Basic ${Buffer.from(`${participant}:${participant}`).toString('base64')}`,
			'content-type': 'application/json',
			// 'content-length': Buffer.byteLength(buf),
			'content-encoding': 'identity'
		},
		body: JSON.stringify({
			swap: { id: swapId },
			party: {
				id: id,
				state: Object.assign(participant.state, {secret: secret})
			}
		})
	});
};

export const commitSwap = async ({swapId, id, participant}) => {
	// const buf = (data && JSON.stringify(data)) || ''
	return await fetch('/api/v1/swap', {
		method: 'POST',
		headers: { 
			accept: 'application/json',
			'accept-encoding': 'application/json',
			authorization: `Basic ${Buffer.from(`${participant}:${participant}`).toString('base64')}`,
			'content-type': 'application/json',
			// 'content-length': Buffer.byteLength(buf),
			'content-encoding': 'identity'
		},
		body: JSON.stringify({
			swap: { id: swapId },
			party: {
				id: id,
				state: participant.state
			}
		})
	})
};

export const getBTCPrice = async () => {
	const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
	const data = await res.json();
	return data.data.amount;
}
export const getETHPrice = async () => {
	const res = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot');
	const data = await res.json();
	return data.data.amount;
}
