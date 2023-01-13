'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2023-01-01T23:36:17.929Z',
    '2023-01-06T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();

  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call print the remanining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };
  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// // FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Creat Current Date and Time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add Transfer Date

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add Loan Date

      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/* 
console.log(23 === 23.0); // true

console.log(0.1 + 0.2); // 0.30000000000000004. Tıpkı ondalık sistemde 10/3= 3.33333333 diye gidiyorsa burda da ikilik binary sistemde bir çeşit bug gibi bir şey oluyor. JS'de bundan kaçış yok
console.log(0.1 + 0.2 === 0.3); // false

// Conversion
console.log(Number('23')); // 23 (number)
console.log(+'23'); // 23 (number). Kestirme yöntem olarak bunu tercih ediyor Jonas.

// Parsing
// Burada ikinci bir argüman kabul ediyor regex adında. Bu da kullandığımız sayı sisteminin kaçlık tabanda olduğunu belirtmek demek. Neredeyse her zaman 10 yazmalıyız.
console.log(Number.parseInt('30px', 10)); // 30
console.log(Number.parseInt('e23', 10)); // NaN . Çünkü harfle başlıyor.

console.log(Number.parseFloat('2.5rem')); // 2.5

// Check
console.log(Number.isNaN(20)); // false
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0)); // false

console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(+'20X')); // false
console.log(Number.isFinite(23 / 0)); // false

 */

// Math and Rounding
/* 
console.log(Math.sqrt(25)); // 5
console.log(25 ** (1 / 2)); // 5
console.log(8 ** (1 / 3)); // 2

console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, '23', 11, 2)); // 23. Because of type conversion.
console.log(Math.max(5, 18, '23px', 11, 2)); // NaN. because parsing is not include

console.log(Math.min(5, 18, 23, 11, 2)); // 2

console.log(Math.PI * Number.parseFloat('10px') ** 2); // 314.1592653589793

console.log(Math.trunc(Math.random() * 6 + 1)); // 1-6 arası random

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;

// 0...1 -> 0...(max-min) -> min...max

console.log(randomInt(10, 20)); // 10-20 arası random

// Rounding Integers
console.log(Math.trunc(23.3)); // 23
console.log(Math.trunc(23.9)); // 23

console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); // 24

console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.9)); // 24

console.log(Math.floor(23.3)); // 23
console.log(Math.floor(23.9)); // 23

// floor ve trunc aynı şeyi yapıyor gibi gözükebilir. Pozitif sayılarda öyle. Ancak negatiflerde;

console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); // -24

// Rounding Decimals
// toFixed() string döndürüyor;
console.log((2.7).toFixed(0)); // 3 (string)
console.log((2.7).toFixed(3)); // 2.700 (string)
console.log((2.345).toFixed(2)); // 2.35 (string)
console.log(+(2, 345).toFixed(2)); // 345 (number)
//aslında sayılar primitive. öyleyse nasıl methodları oluyor? JS arkaplanda boxing yapıyor. Sayıyı sayı nesnesine dönüştürüyor ve method çağrıyor. İşlem bitince yeniden primitive'e döndürüyor.

// Numeric Separators

// 287,450,000,000
const diameter = 287_450_000_000;
console.log(diameter); // 287450000000

const price = 345_99;
console.log(price); // 34599

console.log(Number('230_000')); // NaN
console.log(parseInt('230_000')); // 230

 */

// BigInt

/* 
console.log(2 ** 53 - 1); // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(2 ** 53 + 1); // 9007199254740992
console.log(2 ** 53 + 2); // 9007199254740994
console.log(2 ** 53 + 3); // 9007199254740996
console.log(2 ** 53 + 4); // 9007199254740996
//Bazıları doğru gözükse de safe değil, genelde hatalı. en büyük safe sayı en baştaki. Daha büyük sayılarla çalışabilmek için ES2020'den itibaren BigInt adında primitive eklendi.

console.log(54458609568045968450698345690834950683n); // 54458609568045968450698345690834950683n

console.log(BigInt(544588)); // 544588n

// Operations
console.log(10000n + 10000n); // 20000n

const huge = 30534753450345983457934n;
const num = 23;
/* 
console.log(huge * num); /* Uncaught TypeError: Cannot mix BigInt and other types, use explicit conversions*/

/*
console.log(huge * BigInt(num)); // 702299329357957619532482n

// Exceptions
console.log(20n > 15); // true
console.log(20n === 0); // false çünkü type conversion yapmıyor '==='
console.log(typeof 20n); // bigint
console.log(20n == 20); // true çünkü '==' type conversion yapıyor
console.log(huge + ' is REALLY big!!!'); // 30534753450345983457934 is REALLY big!!! (string)

// Divisions
console.log(10n / 3n); // 3n. En yakın bigint'i döndürür.

 */

// Create a Date
/* 
const now = new Date();
console.log(now); // Fri Jan 06 2023 17:42:16 GMT+0300 (GMT+03:00)

console.log(new Date('Aug 02 2020 18:05:41')); // Sun Aug 02 2020 18:05:41 GMT+0300 (GMT+03:00)
console.log(new Date('December 24, 2015')); // Thu Dec 24 2015 00:00:00 GMT+0200 (GMT+03:00)
console.log(new Date(account1.movementsDates[0])); // Tue Nov 19 2019 00:31:17 GMT+0300 (GMT+03:00)

console.log(new Date(2037, 10, 19, 15, 23, 5)); // Thu Nov 19 2037 15:23:05 GMT+0300 (GMT+03:00)
console.log(new Date(2037, 10, 31)); // Tue Dec 01 2037 00:00:00 GMT+0300 (GMT+03:00). Aralık'a attı, Kasım 30 çeker.

console.log(new Date(0)); // Thu Jan 01 1970 02:00:00 GMT+0200 (GMT+03:00)
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Sun Jan 04 1970 02:00:00 GMT+0200 (GMT+03:00). Tam 3 gün sonrasına attı 0'ın. Aylar da 0 tabanlı o yüzden aralık 11, ocak 0.
 */

// Working with dates
// Date'ler aslında birer nesne. Bu yüzden metotları da var;
/* 
const future = new Date(2037, 10, 19, 15, 23);
console.log(future); // Thu Nov 19 2037 15:23:00 GMT+0300 (GMT+03:00)
console.log(future.getFullYear()); // 2037
console.log(future.getMonth()); // 10
console.log(future.getDate()); // 19
console.log(future.getDay()); // 4 (day of the week, thursday)
console.log(future.getHours()); // 15
console.log(future.getMinutes()); // 23
console.log(future.getSeconds()); // 0

console.log(future.toISOString()); // 2037-11-19T12:23:00.000Z Bu da uluslararası standardı takip eden ISO stringi. String olarak saklamak istediğimizde bir nesnenin içinde vs kullanışlı.
console.log(future.getTime()); // 2142246180000 January 1970'den o future tarihine kadar geçmiş olan milisaniye. Tersi şekilde düşünürsek;
console.log(new Date(2142246180000)); // Thu Nov 19 2037 15:23:00 GMT+0300 (GMT+03:00)

console.log(Date.now()); // 1673017145181

future.setFullYear(2040);
console.log(future); // Mon Nov 19 2040 15:23:00 GMT+0300 (GMT+03:00)
 */

/* const future = new Date(2037, 10, 19, 15, 23);
console.log(future);

// tarihleri birbirinden çıkardığımızda bize aradaki milisaniye farkını veriyor. aradaki gün sayısını bulmak içşn;

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1); // 10
 */
/* 
const num = 38647464.23;

const options1 = {
  style: 'unit',
  unit: 'mile-per-hour',
};

const options2 = {
  style: 'currency',
  currency: 'EUR',
};

console.log('US:     ', new Intl.NumberFormat('en-US').format(num)); // US:      38,647,464.23
console.log('GERMANY:     ', new Intl.NumberFormat('de-DE').format(num)); // GERMANY:      38.647.464,23
console.log('TURKEY:     ', new Intl.NumberFormat('tr-TR').format(num)); // TURKEY:      38.647.464,23
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(num)
); // tr-TR 38.647.464,23
console.log('US:     ', new Intl.NumberFormat('en-US', options1).format(num)); // US:      38,647,464.23 mph
console.log(
  'GERMANY:     ',
  new Intl.NumberFormat('de-DE', options2).format(num)
); // GERMANY:      38.647.464,23 €
 */

// setTimeOut

const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000); // her saniye o anki tarih kaydını konsola yazdırıyor.
