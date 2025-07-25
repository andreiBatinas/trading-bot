interface State {
  [key: number]: any; // Assuming you can have any kind of data
}

interface TradingState {
  chatId?: any;
}

export const tradingData: State = {};
export const tradingState: State = {};

export const TradingState = {
  AWAITING_SIDE: 'awaiting_side',
  AWAITING_AMOUNT: 'awaiting_amount',
  AWAITING_LEVERAGE: 'awaiting_leverage',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
};

export const clearTradingStates = (chatId: number) => {
  tradingData[chatId] = undefined;
  tradingState[chatId] = undefined;
};
