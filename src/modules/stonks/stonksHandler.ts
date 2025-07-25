import TelegramBot from 'node-telegram-bot-api';

import { Logger } from '../../infrastructure/logger';
import { clearAllStates } from '../states';
import { handleAssets } from './stonksHelper';

const log = new Logger('TradingHandler');

export const handleTopAssets = async (
  msg: TelegramBot.Message,
  match: any,
  all = false
) => {
  const chatId = msg.chat.id;
  await handleAssets(chatId, all);
};

export const handleCallbackQuery = async (
  callbackQuery: TelegramBot.CallbackQuery
) => {
  const chatId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data == '/stonks') {
    clearAllStates(chatId);
    handleTopAssets(callbackQuery.message as TelegramBot.Message, null);
    return;
  }

  if (data == 'stonks:assets:all') {
    clearAllStates(chatId);
    handleTopAssets(callbackQuery.message as TelegramBot.Message, null, true);
    return;
  }
};
