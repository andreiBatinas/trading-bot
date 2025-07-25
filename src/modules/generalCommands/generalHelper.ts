import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';

import { getBot } from '../../botInit';
import { config } from '../../config';
import { Logger } from '../../infrastructure/logger';
import { getUserAddress, getUserApi } from '../../sevices/userApi';
import { clearAllStates } from '../states';

const log = new Logger('General Commands');

export const handleStart = async (msg: TelegramBot.Message, match: any) => {
  const bot = getBot();
  const chatId = msg.chat.id;
  clearAllStates(chatId);

  try {
    const userInfo = await getUserApi(chatId, log);
    if (!userInfo) {
      log.error(
        `Error trying to run /start, userinfo null, cannot reach server`
      );
      return await bot.sendMessage(
        chatId,
        '❌ Error: Please try again or contact support if issue persists'
      );
    }

    const address = userInfo.address;
    const usdcAmount = userInfo.usdc;

    const message = `
    <b>🚀 Welcome to the official Crypto Trading Bot! 🚀</b>


    ════ <b>Account Info</b> ═══
    Balance: <b>${usdcAmount} USD</b>
    Address: <code>${address}</code>

    🔐 Use the <b>Wallet</b> tab to deposit and withdraw ETH on the Ethereum network.
    📈 Monitor your active trades in the <b>Live</b> tab.
    📉 Review your settled and busted positions in the <b>Closed</b> tab.
    🪙 Discover tradable assets in the <b>Assets</b> tab.

    `;

    const buttons = [
      [
        { text: '₿ CRYPTO', callback_data: '/crypto' },
        { text: '🏛 STONKS', callback_data: '/stonks' },
      ],
      [{ text: '📈 LIVE', callback_data: '/live' }],
      [{ text: '📉 CLOSED', callback_data: '/closed' }],
      [{ text: '🔐 WALLET', callback_data: '/wallet' }],
      [{ text: '❓ HELP', callback_data: '/help' }],
    ];

    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: buttons,
      },
      parse_mode: 'HTML',
    });
  } catch (error: any) {
    log.error(`Error trying to run /start error: ${error.message}`);
    await bot.sendMessage(
      chatId,
      '❌ Error: Please try again or contact support if issue persists'
    );
  }
};

const formatPositionMessage = (position: any) => {
  return `Asset: <b>${position.asset}</b>
Amount: $${position.amount}
Leverage: ${position.leverage}x
Status: ${position.status}
Entry Price: ${position.entryPrice}
Exit Price: ${position.exitPrice}
Bust Price: ${position.bustPrice}
PnL: $${position.pnl}
---------------------------`;
};

const formatOpenPositionMessage = (position: any) => {
  return `Asset: <b>${position.asset}</b>
Price: <b>${position.price}</b>
----------------------------
Side: <b> ${position.side} </b>
Amount: $${position.amount}
Leverage: ${position.leverage}x
Status: ${position.status}
Entry Price: ${position.entryPrice}
Bust Price: ${position.bustPrice}
PnL: <b>$${position.pnl}</b>`;
};

export const handleTopClosedOrders = async (
  msg: TelegramBot.Message,
  match: any
) => {
  const chatId = msg.chat.id;
  await handleClosedOrders(chatId);
};

export const handleTopLiveOrders = async (
  msg: TelegramBot.Message,
  match: any
) => {
  const chatId = msg.chat.id;
  await handleLiveOrders(chatId);
};

export const handleHelpGlobal = async (
  msg: TelegramBot.Message,
  match: any
) => {
  const chatId = msg.chat.id;
  await handleHelp(chatId);
};

const handleHelp = async (chatId: number) => {
  const bot = getBot();

  const message =
    `\n` +
    `₿ /crypto: View Available Crypto Trading Assets\n` +
    `🏛 /stonks: View Available Stonks Trading Assets\n` +
    `📈 /live: View your Live positions \n` +
    `📉 /closed: View your closed positions\n` +
    `🔐 /wallet: View your balance, withdraw, and deposit\n` +
    `\n`;

  try {
    await bot.sendMessage(chatId, message);
  } catch (err) {
    console.error('Error showHelpMessage', err);
  }
};

export const handleCallbackQuery = async (
  callbackQuery: TelegramBot.CallbackQuery
) => {
  const chatId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data == '/help') {
    clearAllStates(chatId);
    handleHelp(chatId);
    return;
  }

  if (data == '/closed') {
    clearAllStates(chatId);
    handleClosedOrders(chatId);
    return;
  }

  if (data == '/live') {
    clearAllStates(chatId);
    handleLiveOrders(chatId);
    return;
  }

  if (data == '/start') {
    clearAllStates(chatId);
    handleStart(callbackQuery.message as TelegramBot.Message, null);
    return;
  }
};

export const handleLiveOrders = async (chatId: number) => {
  await clearAllStates(chatId);
  const bot = getBot();
  try {
    const url = `${config.api.url}/trading/open-positions`;
    const privateHeader = config.private.privateHeader;
    const privateKey = config.private.privateHeaderKey;

    const res = await axios({
      method: 'post',
      url,
      data: {
        chatId,
      },
      headers: { [privateHeader]: privateKey },
    });

    const openPositions = res.data;

    if (openPositions.length === 0) {
      await bot.sendMessage(
        chatId,
        `
        🚫 You have no open positions.
        `
      );
      return;
    }

    openPositions.forEach(async (element: any) => {
      const messageText = formatOpenPositionMessage(element);
      const closeButton = {
        text: '❌ Close Position',
        callback_data: `closePosition:${element.id}`, // Assuming each position has a unique ID
      };

      await bot.sendMessage(chatId, messageText, {
        reply_markup: {
          inline_keyboard: [[closeButton]],
        },
        parse_mode: 'HTML',
        disable_notification: true,
      });
    });
  } catch (error) {
    log.error(`Error while calling show open positions ${error}`);
    await bot.sendMessage(
      chatId,
      'Unable process open positions, try again later or contact support'
    );
  }
};

export const handleClosedOrders = async (chatId: number) => {
  await clearAllStates(chatId);
  const bot = getBot();

  try {
    const address = await getUserAddress(chatId, log);

    const url = `${config.api.url}/trading/closed-positions`;
    const privateHeader = config.private.privateHeader;
    const privateKey = config.private.privateHeaderKey;

    const res = await axios({
      method: 'post',
      url,
      data: {
        chatId,
        address,
      },
      headers: { [privateHeader]: privateKey },
    });

    const closedPositions = res.data;

    await bot.sendMessage(
      chatId,
      `
      📜 Here are your latest 10 closed positions:

      `
    );

    if (closedPositions.length === 0) {
      await bot.sendMessage(
        chatId,
        `
        🚫 You have no closed positions.
        `
      );
      return;
    }

    const latestTenClosedPositions = closedPositions
      .sort(
        (a: any, b: any) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 10);

    const messageToSend = latestTenClosedPositions
      .map(formatPositionMessage)
      .join('\n');

    const additionalButtons = [];
    additionalButtons.push(
      [{ text: '🔐 WALLET', callback_data: '/wallet' }],
      [{ text: '🏁 BACK TO START', callback_data: '/start' }],
      [
        { text: '₿ CRYPTO', callback_data: '/crypto' },
        { text: '🏛 STONKS', callback_data: '/stonks' },
      ],
      [{ text: '📈 LIVE', callback_data: '/live' }]
    );

    await bot.sendMessage(chatId, messageToSend, {
      reply_markup: {
        inline_keyboard: additionalButtons,
      },
      parse_mode: 'HTML',
      disable_notification: true,
    });
  } catch (error) {
    log.error(`Error while calling show closed positions ${error}`);
    await bot.sendMessage(chatId, 'Unable process closed positions');
  }
};
