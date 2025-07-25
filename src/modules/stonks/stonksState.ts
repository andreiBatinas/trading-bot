interface State {
  [key: number]: any; // Assuming you can have any kind of data
}

interface StonksState {
  chatId?: any;
}

export const stonksData: State = {};
export const stonksState: State = {};

export const StonksState = {
  AWAITING_SIDE: 'awaiting_side',
  AWAITING_AMOUNT: 'awaiting_amount',
  AWAITING_LEVERAGE: 'awaiting_leverage',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
};

export const clearStonksStates = (chatId: number) => {
  stonksData[chatId] = undefined;
  stonksState[chatId] = undefined;
};
