import { clearTradingStates } from './trading/tradingState';
import { clearWalletStates } from './walletCommands/walletState';

export const clearAllStates = (chatId: number) => {
  clearWalletStates(chatId);
  clearTradingStates(chatId);
};
