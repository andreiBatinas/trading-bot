import TelegramBot from 'node-telegram-bot-api';

import { getBot } from '../../botInit';
import { Logger } from '../../infrastructure/logger';
import { getUserWallet } from '../../sevices/userApi';
import { clearAllStates } from '../states';
import {
  handleAssets,
  handleClosePosition,
  handleConfirmedBet,
  handleSelectedAsset,
} from './tradingHelper';
import { TradingState, tradingData, tradingState } from './tradingState';

const log = new Logger('TradingHandler');

export const handleTopAssets = async (
  msg: TelegramBot.Message,
  match: any,
  all = false
) => {
  const chatId = msg.chat.id;
  await handleAssets(chatId, all);
};

export const handleTopClosePosition = async (
  msg: TelegramBot.Message,
  data: string
) => {
  const chatId = msg.chat.id;
  await handleClosePosition(chatId, data);
};

export const handleTopSelectedAsset = async (
  msg: TelegramBot.Message,
  asset: string
) => {
  const chatId = msg.chat.id;
  await handleSelectedAsset(chatId, asset);
};

export const handleTopConfirmedBet = async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  await handleConfirmedBet(chatId);
};

export const handleCallbackQuery = async (
  callbackQuery: TelegramBot.CallbackQuery
) => {
  const chatId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data == '/crypto') {
    clearAllStates(chatId);
    handleTopAssets(callbackQuery.message as TelegramBot.Message, null);
    return;
  }

  if (data == 'confirmBet') {
    handleTopConfirmedBet(callbackQuery.message as TelegramBot.Message);
  }

  if (data == 'assets:all') {
    clearAllStates(chatId);
    handleTopAssets(callbackQuery.message as TelegramBot.Message, null, true);
    return;
  }

  if (data?.startsWith('closePosition:')) {
    const type = data.replace('closePosition:', '');
    clearAllStates(chatId);
    handleTopClosePosition(callbackQuery.message as TelegramBot.Message, type);
    return;
  }

  if (data?.startsWith('assetInfo:')) {
    const type = data.replace('assetInfo:', '');
    clearAllStates(chatId);
    handleTopSelectedAsset(callbackQuery.message as TelegramBot.Message, type);
    return;
  }

  if (
    tradingState[chatId] !== undefined &&
    tradingState[chatId] === TradingState.AWAITING_SIDE
  ) {
    tradingData[chatId].direction = data;
    tradingState[chatId] = TradingState.AWAITING_AMOUNT;

    const bot = getBot();
    try {
      const walletBalance = await getUserWallet(chatId, log);

      const message = `💰 Account balance: <b>${walletBalance.usdcAmount}</b>
      💵 Please select the amount you want to bid with: \n `;

      const buttons = [
        [
          {
            text: '$2',
            callback_data: '2',
          },
          {
            text: '$5',
            callback_data: '5',
          },
          {
            text: '$10',
            callback_data: '10',
          },
          {
            text: '$20',
            callback_data: '20',
          },
          {
            text: '$50',
            callback_data: '50',
          },
          {
            text: '$100',
            callback_data: '100',
          },
          {
            text: '$200',
            callback_data: '200',
          },
        ],
        [
          {
            text: '$500',
            callback_data: '500',
          },
          {
            text: '$1000',
            callback_data: '1000',
          },
        ],
      ];

      await bot.sendMessage(chatId, message, {
        reply_markup: {
          inline_keyboard: buttons,
        },
        parse_mode: 'HTML',
      });
    } catch (error: any) {
      clearAllStates(chatId);
      log.error(
        `Error on processing trading awaiting side command ${error.message}`
      );
      await bot.sendMessage(chatId, 'Unable process bet, go to /start');
    }
  } else if (
    tradingState[chatId] !== undefined &&
    tradingState[chatId] === TradingState.AWAITING_AMOUNT
  ) {
    const bot = getBot();

    try {
      if (data === undefined) {
        throw new Error('data undefined');
      }

      const amount = parseInt(data);

      tradingData[chatId].amount = amount;
      tradingState[chatId] = TradingState.AWAITING_LEVERAGE;

      const buttons = [
        {
          text: '1x',
          callback_data: '1',
        },
        {
          text: '5x',
          callback_data: '5',
        },
        {
          text: '10x',
          callback_data: '10',
        },
        {
          text: '50x',
          callback_data: '50',
        },
        {
          text: '100x',
          callback_data: '100',
        },
        {
          text: '500x',
          callback_data: '500',
        },
        {
          text: '1000x',
          callback_data: '1000',
        },
      ];

      await bot.sendMessage(chatId, '🔍 Choose your desired leverage amount.', {
        reply_markup: {
          inline_keyboard: [buttons],
        },
        parse_mode: 'HTML',
      });
    } catch (error: any) {
      clearAllStates(chatId);
      log.error(
        `Error on processing trading awaiting amount command ${error.message}`
      );
      await bot.sendMessage(chatId, 'Unable process bet, go to /start');
    }
  } else if (
    tradingState[chatId] !== undefined &&
    tradingState[chatId] === TradingState.AWAITING_LEVERAGE
  ) {
    const bot = getBot();
    try {
      if (data === undefined) {
        throw new Error('data undefined');
      }

      const leverage = parseInt(data);

      tradingData[chatId].leverage = leverage;
      tradingState[chatId] = TradingState.AWAITING_CONFIRMATION;

      const betData = tradingData[chatId];

      const message = `📋 <b>Bet Summary: </b>
      Asset:    ${betData.asset}
      Amount:   $${betData.amount}
      Leverage: ${betData.leverage}x
      Position: ${betData.direction}`;

      await bot.sendMessage(chatId, message, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎲 PLACE BET',
                callback_data: 'confirmBet',
              },
              {
                text: '🏁 START OVER',
                callback_data: '/start',
              },
            ],
          ],
        },
        parse_mode: 'HTML',
      });
    } catch (error: any) {
      clearAllStates(chatId);
      log.error(
        `Error on processing trading awaiting leverage command ${error.message}`
      );
      await bot.sendMessage(chatId, 'Unable process bet, go to /start');
    }
  }
};
