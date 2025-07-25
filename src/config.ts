export const config = {
  redis: {
    url: 'rediss://d',
    prefix: {
      chatIdUserInfo: 'trading:user:id:',
      serverCryptoQuotes: 'server:crypto:quotes',
    },
  },
  api: {
    url: 'http://localhost:9400',
  },
  telegram: {
    botToken: '1111',
  },
  private: {
    privateHeader: 'x-trading',
    privateHeaderKey: '58e7c304-d7db-4d56-8d6a-2ffed0a0065b',
  },
};
