import { getBot } from '../../botInit';
import {
  handleWallet,
  walletHandleCallbackQuery,
  walletHandleMessage,
} from './walletHandler';

export const setupWalletCommands = () => {
  const bot = getBot();

  bot.onText(/\/wallet/, (msg, match) => handleWallet(msg, match));

  bot.on('message', (msg) => walletHandleMessage(msg));
  bot.on('callback_query', (callbackQuery) =>
    walletHandleCallbackQuery(callbackQuery)
  );
};
