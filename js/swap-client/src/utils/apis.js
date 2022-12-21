export const fetchSwapCreate = async ({baseQuantity, quoteQuantity}) => {
	return await fetch('/api/v1/swap/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
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

export const openSwap = async ({participant, swapId, id, secret}) => {
	return await fetch('/api/v1/swap', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json'},
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
	return await fetch('/api/v1/swap', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({
			swap: { id: swapId },
			party: {
				id: id,
				state: participant.state
			}
		})
	})
};