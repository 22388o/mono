const unisat = window.unisat;

export const switchNetwork = async (value) => {
  try {
    const network = await unisat.switchNetwork(value);
    return network;
  } catch (e) {

  }
}

export const signPsbt = async (psbtHex) => {
  try {
    const psbtResult = await window.unisat.signPsbt(psbtHex);
    setPsbtResult(psbtResult);
  } catch (e) {
    setPsbtResult(e.message);
  }
}

export const signMessage = async (message) => {
  const signature = await window.unisat.signMessage(message);
  setSignature(signature);
}

export const pushTxHex = async (txId) => {
  try {
    const txid = await window.unisat.pushTx(rawtx);
    setTxid(txid);
  } catch (e) {
    setTxid(e.message);
  }
}

export const pushPsbtHex = async (psbtHex) => {
  try {
    const txid = await window.unisat.pushPsbt(psbtHex);
    setTxid(txid);
  } catch (e) {
    setTxid(e.message);
  }
}

export const sendBtc = async (addr, sats) => {
  try {
    const txid = await window.unisat.sendBitcoin(
      toAddress,
      satoshis
    );
    setTxid(txid);
  } catch (e) {
    setTxid(e.message);
  }
}