import { getBot } from '../../botInit';
import {
  handleCallbackQuery,
  handleHelpGlobal,
  handleStart,
  handleTopClosedOrders,
  handleTopLiveOrders,
} from './generalHelper';

export const setupGeneralComands = () => {
  const bot = getBot();

  bot.onText(/\/start/, (msg, match) => handleStart(msg, match));
  bot.onText(/\/help/, (msg, match) => handleHelpGlobal(msg, match));

  bot.onText(/\/live/, (msg, match) => handleTopLiveOrders(msg, match));
  bot.onText(/\/closed/, (msg, match) => handleTopClosedOrders(msg, match));

  bot.on('callback_query', (callbackQuery) =>
    handleCallbackQuery(callbackQuery)
  );
};
