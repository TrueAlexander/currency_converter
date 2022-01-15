//select elements
const exchangeRateEL = document.querySelector('.exchange-rate');
const f_select = document.querySelector('.from-currency select');
const t_select = document.querySelector('.to-currency select');
const f_input = document.querySelector('#from-currency-amount');
const t_input = document.querySelector('#to-currency-amount');

//helpers
function fromCurrencyAmount() {
  return f_input.value;
}
function toCurrencyAmount() {
  return t_input.value;
}
function fromCurrencyCode() {
  return f_select.value;
}
function toCurrencyCode() {
  return t_select.value;
}

//consts and vars
const DEFAULT_BASE_CURRENCY_CODE = 'USD';
const DATA_PRECISION = 2;
let exchangeRate, currencies;

// API PROVIDERS
const ipdata = {
  baseurl: 'https://api.ipdata.co',
  key: '13952c49cd907f6b9a168b62b0b2364ba3eb022e303cd6aec6afb8cd',

  currency: function () {
    return `${this.baseurl}/currency?api-key=${ipdata.key}`;
  },
};
const currencyLayer = {
  baseurl: 'http://api.currencylayer.com',
  key: '816aace5f867a203d108dde0987d9681',

  list: function () {
    return `${this.baseurl}/list?access_key=${this.key}`;
  },
  convert: function (from, to, amount) {
    return `${this.baseurl}/convert?from=${from}&to=${to}&amount=${amount}&access_key=${this.key}`;
  },
};

//Get users currency

async function getUserCurrency() {
  const res = await fetch(ipdata.currency());
  const userCurrency = await res.json();

  return userCurrency;
}

//get currencies 
async function getCurrencies() {
  const res = await fetch(currencyLayer.list());
  const data = await res.json();

  return data.currencies;
}

//get exchange rate
async function getExchangeRate(fromCurrencyCode, toCurrencyCode) {
  const amount = 1;
  const res = await fetch(currencyLayer.convert(fromCurrencyCode, toCurrencyCode, amount));
  const data = await res.json();

  return data.result;
}

getExchangeRate('USD', 'GBP');

//render exchange rate
async function renderExchangeRate(fromCurrencyCode, toCurrencyCode) {
  exchangeRate = await getExchangeRate(fromCurrencyCode, toCurrencyCode);

  plural = exchangeRate === 1 ? "" : "s";
  exchangeRateEL.innerHTML = `
    <p>1 ${currencies[fromCurrencyCode]} equals</p>
    <h1>${exchangeRate.toFixed(DATA_PRECISION)} ${currencies[toCurrencyCode]}${plural}</h1>
  `
}
// render currencies 
function renderCurrencies(currencies, fromCurrencyCode, toCurrencyCode) {
  for (const code in currencies) {
    const name = currencies[code];

    selectedFromCurrency = code === fromCurrencyCode ? 'selected' : '';
    selectedToCurrency = code === toCurrencyCode ? 'selected' : '';

    f_select.innerHTML += `<option value="${code}" ${selectedFromCurrency}>
                            ${code} - ${name}
                          </option>`;
    t_select.innerHTML += `<option value="${code}" ${selectedToCurrency}>
                          ${code} - ${name}
                        </option>`;
  }
}
///convert
function convert(direction) {
  if (direction === 'from->to') {
    t_input.value = (fromCurrencyAmount() * exchangeRate).toFixed(DATA_PRECISION);
  } else if (direction === 'to->from') {
    f_input.value = (toCurrencyAmount() / exchangeRate).toFixed(DATA_PRECISION);
  }
}
//Initialize App
async function init() {
  const userCurrency = await getUserCurrency();
  currencies = await getCurrencies();
  //render exchange rate
  await renderExchangeRate(DEFAULT_BASE_CURRENCY_CODE, userCurrency.code);
  //render currencies to select options
  renderCurrencies(currencies, DEFAULT_BASE_CURRENCY_CODE, userCurrency.code);
  //convert
  convert('from->to');
}

init();

// event listeners
t_input.addEventListener('input', () => {
  convert('to->from');
})
f_input.addEventListener('input', () => {
  convert('from->to');
})

t_select.addEventListener('change', async () => {
  await renderExchangeRate(fromCurrencyCode(), toCurrencyCode());
  convert('to->from');
})
f_select.addEventListener('change', async () => {
  await renderExchangeRate(fromCurrencyCode(), toCurrencyCode());
  convert('from->to');
})

