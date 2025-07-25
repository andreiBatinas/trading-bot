interface State {
  [key: number]: any; // Assuming you can have any kind of data
}

interface WalletState {
  chatId?: any;
}

export const walletData: State = {};
export const walletState: State = {};

export const WalletState = {
  AWAITING_ADDRESS: 'awaiting_address',
  AWAITING_AMOUNT: 'awaiting_amount',
};

export const clearWalletStates = (chatId: number) => {
  walletData[chatId] = undefined;
  walletState[chatId] = undefined;
};
