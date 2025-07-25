import { getBot } from '../../botInit';
import { handleCallbackQuery, handleTopAssets } from './tradingHandler';

export const setupTradingCommands = () => {
  const bot = getBot();

  bot.onText(/\/crypto/, (msg, match) => handleTopAssets(msg, match));

  bot.on('callback_query', (callbackQuery) =>
    handleCallbackQuery(callbackQuery)
  );
};
