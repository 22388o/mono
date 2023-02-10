import {Buffer} from 'buffer';

export const fetchSwapCreate = async ({baseQuantity, quoteQuantity}) => {
	return await fetch('/api/v1/swap/create', {
		method: 'POST',
		headers: { 
			accept: 'application/json',
			'accept-encoding': 'application/json',
			authorization: `Basic ${Buffer.from(`uid:uid`).toString('base64')}`,
			'content-type': 'application/json',
			// 'content-length': Buffer.byteLength(buf),
			'content-encoding': 'identity'
		},
		body: JSON.stringify({
			makerOrderProps: {
				uid: 'uid1',
				hash: null,
				side: 'ask',
				type: 'limit',
				baseAsset: 'BTC1',
				baseNetwork: 'lightning',
				baseQuantity: baseQuantity,
				quoteAsset: 'BTC2',
				quoteNetwork: 'lightning',
				quoteQuantity: quoteQuantity
			},
			takerOrderProps: {
				uid: 'uid0',
				hash: null,
				side: 'bid',
				type: 'limit',
				baseAsset: 'BTC1',
				baseNetwork: 'lightning',
				baseQuantity: baseQuantity,
				quoteAsset: 'BTC2',
				quoteNetwork: 'lightning',
				quoteQuantity: quoteQuantity
			}
		})
	});
};
export const createLimitOrder = async ({baseAsset, baseNetwork, baseQuantity, quoteAsset, quoteNetwork, quoteQuantity, hash}) => {
	let side = hash == null ? 'bid' : 'ask';
	return await fetch('/api/v1/orderbook/limit', {
		method: 'POST',
		headers: { 
			accept: 'application/json',
			'accept-encoding': 'application/json',
			// authorization: `Basic ${Buffer.from(`${participant}:${participant}`).toString('base64')}`,
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
