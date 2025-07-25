import TelegramBot from 'node-telegram-bot-api';

import { config } from './config';

let bot: TelegramBot;

export const setUpTgBot = () => {
  bot = new TelegramBot(config.telegram.botToken, { polling: true });
};

export const getBot = () => {
  return bot;
};
