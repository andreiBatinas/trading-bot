export const currencyFormatter = (
  amountOrAmountInString: any,
  optionsObj?: any
) => {
  const defaultOptions = {
    language: 'en-US',
    currency: 'USD',
    decimalDigits: 2,
    noCurrencySign: false,
    stringOnError: '\u2014',
    useLongNumber: false,
  };
  const mergedOptions = { ...defaultOptions, ...optionsObj };
  const {
    language,
    currency,
    decimalDigits,
    noCurrencySign,
    stringOnError,
    useLongNumber,
  } = mergedOptions;
  const options = {
    style: noCurrencySign ? undefined : 'currency',
    currency: noCurrencySign ? undefined : currency,
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  };
  const longNumberOptions = {
    style: noCurrencySign ? undefined : 'currency',
    currency: noCurrencySign ? undefined : currency,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    notation: 'scientific',
  };

  const isLongNumber = isNaN(amountOrAmountInString)
    ? false
    : decimalDigits >= 6 || amountOrAmountInString > 999999;
  const numberFormatter = new Intl.NumberFormat(
    language,
    useLongNumber ? options : isLongNumber ? longNumberOptions : options
  );

  const formattedNumber =
    numberFormatter.format(amountOrAmountInString || 0) || stringOnError;

  return formattedNumber.replace('E', 'e');
};
