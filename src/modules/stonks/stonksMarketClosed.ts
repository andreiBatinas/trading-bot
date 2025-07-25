import { DateTime } from 'luxon';

export const STOCK_MARKET_TIME = {
  openTimeUtc: '13:30',
  closeTimeUtc: '19:55',
};
export const STOCK_MARKET_DAYS_OFF = [
  {
    dateObj: { month: 2, day: 20 },
    reason: {
      title: `Due to Presidents' Day, stocks are currently closed for trading.`,
      subtitle: `The markets will be open this week from Tuesday - Friday from ${STOCK_MARKET_TIME.openTimeUtc} UTC to  ${STOCK_MARKET_TIME.closeTimeUtc} UTC.`,
    },
  },
  {
    dateObj: { month: 4, day: 7 },
    reason: {
      title: `The stocks are currently closed for trading today.`,
      subtitle: ` The markets will be open next week from Monday - Friday from ${STOCK_MARKET_TIME.openTimeUtc} UTC to  ${STOCK_MARKET_TIME.closeTimeUtc} UTC.`,
    },
  },
  {
    dateObj: { month: 5, day: 29 },
    reason: {
      title: `Due to the holiday, stocks are currently closed for trading. `,
      subtitle: `The markets will be open this week from Tuesday - Friday from ${STOCK_MARKET_TIME.openTimeUtc} UTC to  ${STOCK_MARKET_TIME.closeTimeUtc} UTC.`,
    },
  },
  {
    dateObj: { month: 6, day: 19 },
    reason: {
      title: `Stock markets are closed today`,
      subtitle: `The markets will be open this week from Tuesday - Friday from ${STOCK_MARKET_TIME.openTimeUtc} UTC to  ${STOCK_MARKET_TIME.closeTimeUtc} UTC.`,
    },
  },
];

export const isStockMarketOpen = (): {
  state: boolean;
  reason: string | null;
} => {
  const { openTimeUtc, closeTimeUtc } = STOCK_MARKET_TIME;

  const utcDate = new Date(
    (Date.now() / 1000 + new Date().getTimezoneOffset() * 60) * 1000
  );

  const today = DateTime.utc();
  const dayOff = STOCK_MARKET_DAYS_OFF.find((item) => {
    const dtOffDay = DateTime.fromObject(item.dateObj, { zone: 'utc' });
    return (
      today.startOf('day').toMillis() === dtOffDay.startOf('day').toMillis()
    );
  });

  if (!!dayOff) return { state: false, reason: dayOff.reason.title };

  if (today.weekday === 6 || today.weekday === 7)
    return { state: false, reason: null };

  const YYYY = utcDate.getFullYear();
  const MM = utcDate.getMonth();
  const DD = utcDate.getDate();

  const [oh, om, os = '00'] = openTimeUtc.split(':');
  const [ch, cm, cs = '00'] = closeTimeUtc.split(':');

  const openDateUtc = new Date(
    YYYY,
    MM,
    DD,
    parseInt(oh, 10),
    parseInt(om, 10),
    parseInt(os, 10)
  );
  const closeDateUtc = new Date(
    YYYY,
    MM,
    DD,
    parseInt(ch, 19),
    parseInt(cm, 10),
    parseInt(cs, 10)
  );

  const utcTimeStamp = utcDate.getTime();
  const openTimeStamp = openDateUtc.getTime();
  const closeTimeStamp = closeDateUtc.getTime();

  if (utcTimeStamp > openTimeStamp && utcTimeStamp < closeTimeStamp)
    return { state: true, reason: null };

  return { state: false, reason: null };
};
