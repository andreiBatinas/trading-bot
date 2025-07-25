import axios from 'axios';

import { getBot } from '../../botInit';
import { config } from '../../config';
import { Logger } from '../../infrastructure/logger';
import { currencyFormatter } from '../../sevices/curency';
import { getUserWallet } from '../../sevices/userApi';
import { clearAllStates } from '../states';
import { tradingData, TradingState, tradingState } from './tradingState';

const log = new Logger('Assets');

const generateAssetButtons = (assets: any, showAll = false) => {
  let displayedAssets;
  if (showAll) {
    displayedAssets = assets;
  } else {
    displayedAssets = assets.slice(0, 10);
  }
  const assetButtons = displayedAssets.map((asset: any) => [
    {
      text: `🪙 ${asset.symbol} - $${asset.price}`,
      callback_data: `assetInfo:${asset.symbol}`,
    },
  ]);

  const additionalButtons = [];

  if (!showAll) {
    additionalButtons.push([{ text: 'More', callback_data: 'assets:all' }]);
  }

  additionalButtons.push(
    [{ text: '🔐 WALLET', callback_data: '/wallet' }],
    [{ text: '🏁 BACK TO START', callback_data: '/start' }]
  );

  return {
    reply_markup: {
      inline_keyboard: [...assetButtons, ...additionalButtons],
    },
  };
};

export const handleAssets = async (chatId: number, all = false) => {
  const bot = getBot();

  try {
    const url = `${config.api.url}/trading/trading-assets`;
    const privateHeader = config.private.privateHeader;
    const privateKey = config.private.privateHeaderKey;

    const res = await axios({
      method: 'get',
      url,
      data: {},
      headers: { [privateHeader]: privateKey },
    });

    const walletBalance = await getUserWallet(chatId, log);

    await bot.sendMessage(
      chatId,
      `💰 Account balance: <b>${currencyFormatter(walletBalance.usdcAmount)}</b>

      📊 Trade Now!
      Please select an asset from the list above to start trading. 🚀🔝
      `,
      {
        parse_mode: 'HTML',
      }
    );

    const assetList = res.data.crypto;

    if (assetList.length === 0) {
      throw new Error('no assets available');
    }

    const options = generateAssetButtons(assetList, all);

    await bot.sendMessage(chatId, 'Assets', options);
  } catch (error: any) {
    log.error(`Error on /assets message ${error.message}`);
    await bot.sendMessage(
      chatId,
      '❌ Error: Please try again or contact support.'
    );
  }
};

export const handleSelectedAsset = async (chatId: number, asset: string) => {
  const bot = getBot();

  try {
    tradingData[chatId] = {
      asset,
    };

    tradingState[chatId] = TradingState.AWAITING_SIDE;

    const message =
      "🔼🔽 Please select if you want to place an order going 'Up' or 'Down'. \n";

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔼 UP', callback_data: 'up' },
            { text: '🔽 DOWN', callback_data: 'down' },
          ],
        ],
      },
    };

    await bot.sendMessage(chatId, message, opts);
  } catch (error: any) {
    log.error(`Error on assetInfo:${asset} message ${error.message}`);
    await bot.sendMessage(
      chatId,
      '❌ Error: Please try again or contact support.'
    );
  }
};

export const handleConfirmedBet = async (chatId: number) => {
  const bot = getBot();

  try {
    const data = tradingData[chatId];

    const url = `${config.api.url}/trading/create-trade`;
    const privateHeader = config.private.privateHeader;
    const privateKey = config.private.privateHeaderKey;

    const res = await axios({
      method: 'post',
      url,
      data: {
        chatId,
        asset: data.asset,
        side: data.direction,
        amount: data.amount,
        leverage: data.leverage,
        assetType: 'crypto',
      },
      headers: { [privateHeader]: privateKey },
    });

    if (res.data.status === 'fail') {
      log.error(`Error while placing bet ${res.data.error}`);
      if (res.data.code === 'MARKET_CLOSED') {
        clearAllStates(chatId);
        await bot.sendMessage(chatId, '❌ Stock Market is closed.');
        return;
      }
      if (res.data.code === 'RESTRICTED') {
        clearAllStates(chatId);
        await bot.sendMessage(chatId, '❌ Asset temporarily restricted. ');
        return;
      }
      throw new Error('Failed to place bet. Try again or contact support.');
    }

    await bot.sendMessage(
      chatId,
      `
      🎉 Bet placed successfully! 🎉
      Keep an eye on your asset's performance and good luck! Remember, trading is risky. Always make informed decisions. 📈🍀

      `,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '₿ CRYPTO', callback_data: '/crypto' },
              { text: '🏛 STONKS', callback_data: '/stonks' },
            ],
            [{ text: '📈 LIVE', callback_data: '/live' }],
            [{ text: '📉 CLOSED', callback_data: '/closed' }],
            [{ text: '🔐 WALLET', callback_data: '/wallet' }],
          ],
        },
        parse_mode: 'Markdown',
      }
    );
    clearAllStates(chatId);
  } catch (error: any) {
    clearAllStates(chatId);
    log.error(`Error on confirmed bet message ${error.message}`);
    await bot.sendMessage(
      chatId,
      '❌ Error: Please try again or contact support.'
    );
  }
};

export const handleClosePosition = async (chatId: number, id: string) => {
  const bot = getBot();

  try {
    const url = `${config.api.url}/trading/close-trade`;
    const privateHeader = config.private.privateHeader;
    const privateKey = config.private.privateHeaderKey;

    const res = await axios({
      method: 'post',
      url,
      data: {
        chatId,
        id,
      },
      headers: { [privateHeader]: privateKey },
    });

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

    const walletBalance = await getUserWallet(chatId, log);
    await bot.sendMessage(
      chatId,
      `
      💰 Account balance: <b>${walletBalance.usdcAmount}</b>
      Your position has been successfully closed. 🎉 Please check the 'Closed Positions' for additional details.`,
      {
        reply_markup: {
          inline_keyboard: buttons,
        },
        parse_mode: 'HTML',
      }
    );
  } catch (error: any) {
    log.error(`Error on closing position ${error.message}`);
    await bot.sendMessage(chatId, '❌ Error: Please try again.');
  }
};
