import { getBot } from '../../botInit';
import { handleCallbackQuery, handleTopAssets } from './stonksHandler';

export const setupStonksCommands = () => {
  const bot = getBot();

  bot.onText(/\/stonks/, (msg, match) => handleTopAssets(msg, match));

  bot.on('callback_query', (callbackQuery) =>
    handleCallbackQuery(callbackQuery)
  );
};
