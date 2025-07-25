import axios from 'axios';

import { getBot } from '../botInit';
import { config } from '../config';
import { Logger } from '../infrastructure/logger';

const log = new Logger('UserApi');

export const createUserApi = async (chatId: number, log: Logger) => {
  let address = null;
  try {
    const url = `${config.api.url}/user/create`;
    const privateHeader = config.private.privateHeader;
    const privateKey = config.private.privateHeaderKey;
    const res = await axios({
      method: 'post',
      url,
      data: { chatId },
      headers: { [privateHeader]: privateKey },
    });

    address = res.data.address;
  } catch (error: any) {
    log.error(`Error while creating user ${error.message}`);
  }

  return address;
};

export const getUserApi = async (chatId: number, log: Logger) => {
  let userInfo = null;
  try {
    const url = `${config.api.url}/user/info`;
    const privateHeader = config.private.privateHeader;
    const privateKey = config.private.privateHeaderKey;
    const res = await axios({
      method: 'post',
      url,
      data: { chatId },
      headers: { [privateHeader]: privateKey },
    });

    if (res.data.status === 'fail') {
      const address = await createUserApi(chatId, log);
      userInfo = {
        address: address,
        usdc: '0',
      };
      return userInfo;
    }

    userInfo = res.data.user;
  } catch (error: any) {
    log.error(`Error while getting user  ${error.message}`);
  }

  return userInfo;
};

export const getUserAddress = async (chatId: number, log: Logger) => {
  const userInfo = await getUserApi(chatId, log);
  if (!userInfo) {
    throw new Error(`Error while placing bet, please try again later`);
  }

  const address = userInfo.address;

  return address;
};

export const getUserWallet = async (chatId: number, log: Logger) => {
  const bot = getBot();

  const userInfo = await getUserApi(chatId, log);
  if (!userInfo) {
    log.error(`Error trying to run /start, userinfo null, cannot reach server`);
    await bot.sendMessage(
      chatId,
      '❌ Error: Please try again or contact support if issue persists'
    );
    throw new Error('not user info available');
  }

  const address = userInfo.address;
  const usdcAmount = userInfo.usdc;

  return {
    address,
    usdcAmount,
  };
};
