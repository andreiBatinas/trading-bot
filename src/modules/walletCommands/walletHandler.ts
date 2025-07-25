import TelegramBot from 'node-telegram-bot-api';

import { Logger } from '../../infrastructure/logger';
import { clearAllStates } from '../states';
import {
  walletDepositEthereum,
  walletInfo,
  walletStateProgress,
  walletWithdraw,
  walletWithdrawConfirm,
} from './walletHelper';
import { walletState } from './walletState';

const log = new Logger('Wallet');

export const handleWallet = async (msg: TelegramBot.Message, match: any) => {
  const chatId = msg.chat.id;
  clearAllStates(chatId);
  await walletInfo(chatId, log);
};

export const walletHandleMessage = async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;

  if (!msg.text) {
    console.log('audio message ? => ', msg);
    return;
  }
  if (walletState[chatId] !== undefined) {
    await walletStateProgress(msg, log);
    return;
  }
};

export const walletHandleCallbackQuery = async (
  callbackQuery: TelegramBot.CallbackQuery
) => {
  const chatId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data === '/wallet') {
    clearAllStates(chatId);
    walletInfo(chatId, log);
    return;
  }

  if (data === 'wallet:deposit:ethereum') {
    clearAllStates(chatId);
    await walletDepositEthereum(callbackQuery, log);
    return;
  }

  if (data === 'wallet:withdraw') {
    clearAllStates(chatId);
    await walletWithdraw(callbackQuery, log);
    return;
  }

  if (data === 'wallet:withdraw:confirm') {
    await walletWithdrawConfirm(callbackQuery, log);
    return;
  }
};
