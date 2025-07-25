import axios from 'axios';

import { getBot } from '../../botInit';
import { config } from '../../config';
import { Logger } from '../../infrastructure/logger';
import { currencyFormatter } from '../../sevices/curency';
import { getUserWallet } from '../../sevices/userApi';
import { isStockMarketOpen } from './stonksMarketClosed';

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
    additionalButtons.push([
      { text: 'More', callback_data: 'stonks:assets:all' },
    ]);
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

    const isOpen = isStockMarketOpen();
    if (!isOpen.state) {
      await bot.sendMessage(
        chatId,
        '❌ Please note: The stock market is currently closed.'
      );
    }

    const assetList = res.data.stocks;

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
