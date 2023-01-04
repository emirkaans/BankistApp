'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>
    `;

    //insertAdjacentHTML metodu 2 string alıyor argüman olarak. İlki HTML'i eklemek istediğimiz konum(afterbegin). İkincisi de eklemek istediğimiz HTML'i içeren string(html).

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance} EUR`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = `${interest}€`;
};

const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUserNames(accounts);

const updateUI = function (acc) {
  // Display Movements
  displayMovements(acc.movements);
  // Display Balance
  calcDisplayBalance(acc);
  // Display Summary
  calcDisplaySummary(acc);
};

const clearInput = function (el) {
  el.value = '';
  el.blur();
};

// Event Handler

let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  // Aşağıdaki if condition'da Optional Chaining(?.) kullanıyoruz currentAccount'un tanımsız bir değer olduğunda error almak yerine undefined uyarısı almak için;
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields

    clearInput(inputLoginUsername);
    clearInput(inputLoginPin);

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

  // Clear Input
  clearInput(inputTransferAmount);
  clearInput(inputTransferTo);

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // add movement
    currentAccount.movements.push(amount);

    // update UI
    updateUI(currentAccount);
  }
  // Clear input
  clearInput(inputLoanAmount);
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

    // Delete Account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  // Clear input area
  clearInput(inputCloseUsername);
  clearInput(inputClosePin);
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
}); /*

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

/* let arr = ['a', 'b', 'c', 'd', 'e']; */

/* // SLICE
console.log(arr.slice(2)); // (3) ['c', 'd', 'e']
console.log(arr.slice(2, 4)); // (2) ['c', 'd']
console.log(arr.slice(-2)); // (2) ['d', 'e']
console.log(arr.slice(-3, 4)); // (2) ['c', 'd']
console.log(arr.slice(1, -2)); // (2) ['b', 'c']
console.log(arr.slice()); // (5) ['a', 'b', 'c', 'd', 'e'] (original)
console.log(...arr); // (5) ['a', 'b', 'c', 'd', 'e'] (also original)

// SPLICE
console.log(arr.splice(2)); // (3) ['c', 'd', 'e']
console.log(arr); // (2) ['a', 'b'] (orijinal array değişti bu sefer)
/* Bu yüzden çoğu zaman splice'ın döndürdüğü değer bizi ilgilendirmez. Orjinal array üzerinde yaptığı manipülasyon önemli */

/* arr = ['a', 'b', 'c', 'd', 'e'];
const b = arr.splice(-1); // Son elemanı silme
console.log(b); // ['e'] (bu silinen değeri array olarak bir const variable'a atayabiliriz)
console.log(arr); // (4) ['a', 'b', 'c', 'd']
arr.splice(1, 2); // 1.Parameter: Start / 2.Paramter: deleteCount
console.log(arr); */ // (2) ['a', 'd'] */

/* // REVERSE
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse()); // ['f', 'g', 'h', 'i', 'j']
console.log(arr2); // ['f', 'g', 'h', 'i', 'j'] (manipüle etti orjinali)

// CONCAT
const letters = arr.concat(arr2);
console.log(letters); // (10) ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
console.log([...arr, ...arr2]); // (10) ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] (same, both does NOT manipulate orginal Array)

// JOIN
console.log(letters.join(' - ')); // a - b - c - d - e - f - g - h - i - j (string döndürdü) */

// at Method
/* 
const arr = [23, 11, 64];
console.log(arr[0]); // 23
console.log(arr.at(0)); // 23

// getting last element of array
console.log(arr[arr.length - 1]); // 64
console.log(arr.slice(-1)[0]); // 64
console.log(arr.at(-1)); // 64

/* Array'den basitçe bir sıra değeri almak istediğin zaman geleneksel yollar hala daha gayet iyi. Ancak son elemana ulaşma, son elemandan geriye doğru gitme veya method chain gibi durumlarda at method gayet kullanışlı */
/* 
// stringlerde de çalışıyor;
console.log('emir'.at(0)); // e
console.log('emir'.at(-1)); // r */

/* const movements = [200, 450, -400, 3000, -650, -130, 70, 1300]; */

// for of

/* for (const movement of movements) {
  if (movement > 0) {
    console.log(`You deposited ${movement}`);
  } else {
    console.log(`You withdrew ${Math.abs(movement)}`);
  }
} */

/* 
You deposited 200
You deposited 450
You withdrew 400
You deposited 3000
You withdrew 650
You withdrew 130
You deposited 70
You deposited 1300
*/

// for each
//Call back function usulü loop aslında. Array'in her bir elemanını, argüman olarak alıyor;

/* movements.forEach(function (mov, i, arr) {
  if (mov > 0) {
    console.log(`Movement ${i + 1}: You deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(mov)}`);
  }
}); */

/* 
Movement 1: You deposited 200
Movement 2: You deposited 450
Movement 3: You withdrew 400
Movement 4: You deposited 3000
Movement 5: You withdrew 650
Movement 6: You withdrew 130
Movement 7: You deposited 70
Movement 8: You deposited 1300
*/

// Argümanlarda önemli olan isimler değil, sıralama. İlk parametre current eleman, ikincisi current index, üçüncüsü de döngü yapılan Array'in tamamı.

// 0: function(200)
// 1: function(450)
// 2: function(400)

// MAP
/* const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
}); */

/* 
USD: United States dollar
EUR: Euro
GBP: Pound sterling
*/

// SET
/* const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique); // Set(3) {'USD', 'GBP', 'EUR'}

currenciesUnique.forEach(function (value, _, set) {
  console.log(`${value}: ${value}`);
}); */

/* 
USD: USD
GBP: GBP
EUR: EUR
*/

// Bunun anlamı, buradaki anahtarın değerle tamamen aynı olduğudur. Neden peki? Bir setin KEY'i olmaz. Ayrıca INDEX de yok. Dolayısıyla, key için anlamlı olabilecek bir değer yoktur. Kümeler için bu forEach yöntemini tasarlayan kişiler, ikinci argümanı basitçe atlayabilirlerdi ama kafa karışıklığı olmasın diye tuttular. O yüzden '_' ile önemsiz olduğunu gösteren bir sembol bıraktık yukarda da.

// Coding Challenge #1

/* const dogsJulia = [3, 5, 2, 12, 7];
const dogsKate = [4, 1, 15, 8, 3];

const checkDogs = function (arrJ, arrK) {
  const newArrJ = [...arrJ];
  newArrJ.splice(-2);
  newArrJ.shift();

  const bothArr = [...newArrJ, ...arrK];

  bothArr.forEach(function (arr, index) {
    const type = arr < 3 ? 'puppy' : 'adult';

    if (type === 'puppy')
      console.log(`The dog number ${index} is still a puppy 🐶`);
    else
      console.log(`The dog number ${index} is an adult, and ${arr} years old`);
  });
};

checkDogs(dogsJulia, dogsKate); */

// the Map Method

/* const eurToUsd = 1.1;

const movementsUSD = movements.map(function (mov) {
  return mov * eurToUsd;
}); */

/* console.log(movements); // (8) [200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(movementsUSD);  */ // (8) [220.00000000000003, 495.00000000000006, -440.00000000000006, 3300.0000000000005, -715.0000000000001, -143, 77, 1430.0000000000002]

/* const movementArrow = movements.map(mov => mov * eurToUsd);
console.log(movementArrow); // same as above

const movementsDescription = movements.map((mov, i) => {
  return `Movement ${i + 1}: You ${
    mov > 0 ? 'deposited' : 'withdrew'
  } ${Math.abs(mov)}`;
});
console.log(movementsDescription); */
/* 
(8) ['Movement 1: You deposited 200', 'Movement 2: You deposited 450', 'Movement 3: You withdrew 400', 'Movement 4: You deposited 3000', 'Movement 5: You withdrew 650', 'Movement 6: You withdrew 130', 'Movement 7: You deposited 70', 'Movement 8: You deposited 1300']
*/

// the Filter Method

/* const deposits = movements.filter(function (mov) {
  return mov > 0;
});

console.log(movements); // (8) [200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(deposits); // (5) [200, 450, 3000, 70, 1300]

const withdrawals = movements.filter(mov => mov < 0);

console.log(withdrawals); */

// the Reduce Method

// accumulator = SNOWBALL
/* const balance = movements.reduce(function (acc, cur, i, arr) {
  console.log(`Iteration ${i}: ${acc}`);
  return acc + cur;
}, 0); // acc için başlangıç değeri

console.log(balance); */
/* 
Iteration 0: 0
Iteration 1: 200
Iteration 2: 650
Iteration 3: 250
Iteration 4: 3250
Iteration 5: 2600
Iteration 6: 2470
Iteration 7: 2540
3840
*/

// Aynı şeyi for of ile yapsaydık;

/* let balance2 = 0; // acc için başlangıç değeri gibi aynı
for (const mov of movements) balance2 += mov;

console.log(balance2); // 3840

// Maximum value
const max = movements.reduce((acc, mov) => {
  if (acc > mov) return acc;
  else return mov;
}, movements[0]);
console.log(max); // 3000

console.log('============='); */

// My exercise START

/* const arr1 = [200, -300, 400, -500, 600, 700, -800, 900];

// Map

const arrMap = arr1.map(
  (mov, i) =>
    ` Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrewed'} ${Math.abs(
      mov
    )} TL`
);

console.log(arrMap);

// Filter

const arrDeposits = arr1.filter(mov => mov > 0);
const arrWithdrews = arr1.filter(mov => mov < 0);

console.log(arrDeposits);
console.log(arrWithdrews);

// Reduce

const arr1Balance = arr1.reduce(function (acc, cur) {
  return acc + cur;
}, 0);

console.log(arr1Balance);

const arr1Maximum = arr1.reduce(function (acc, cur) {
  if (cur > acc) {
    acc = cur;
  }
  return acc;
}, arr1[0]);

console.log(arr1Maximum); */

// My Exercise END

// Coding Challenge #2

/* const calcAverageHumanAge = function (ages) {
  const arrHumanAge = ages.map(function (age) {
    if (age <= 2) return age * 2;
    else return 16 + age * 4;
  });

  const arrRealHuman = arrHumanAge.filter(age => age > 18);

  const averageHumanAge =
    arrRealHuman.reduce(function (acc, cur) {
      return acc + cur;
    }, 0) / arrRealHuman.length;

  return averageHumanAge;
}; */

/* const arr1 = [5, 2, 4, 1, 15, 8, 3];
const arr2 = [16, 6, 10, 5, 6, 1, 4];

const data1 = calcAverageHumanAge(arr1);
const data2 = calcAverageHumanAge(arr2); */

// console.log(data1, data2); // 44 47.333333333333336

// Coding Challenge #3

/* const calcAverageHumanAge = ages => {
  const averageHumanAge = ages
    .map(age => {
      if (age <= 2) return age * 2;
      else return 16 + age * 4;
    })
    .filter(age => age > 18)
    .reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

  return averageHumanAge;
};

const arr1 = [5, 2, 4, 1, 15, 8, 3];
const arr2 = [16, 6, 10, 5, 6, 1, 4];

const data1 = calcAverageHumanAge(arr1);
const data2 = calcAverageHumanAge(arr2);

console.log(data1, data2); // 44 47.333333333333336 */

// the Find Method

// filter metodu gibi koşul veriyoruz. Ancak bu sefer bize bir Array değil bu koşulu sağlayan ilk elementi döndürüyor.

/* const firstWithdrawal = movements.find(mov => mov < 0);

console.log(movements); // (8) [200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(firstWithdrawal); // -400

const account = accounts.find(acc => acc.owner === 'Jessica Davis');

console.log(account); */ // {owner: 'Jessica Davis', movements: Array(8), interestRate: 1.5, pin: 2222, username: 'jd'}

// Aynısını for of ile yapsaydık;
/* 
let acc1;

for (const x of accounts) {
  if (x.owner === 'Jessica Davis') acc1 = x;
}

console.log(acc1); // // {owner: 'Jessica Davis', movements: Array(8), interestRate: 1.5, pin: 2222, username: 'jd'} */

// INCLUDES METHOD yalnızca eşitliği(equality) test ediyordu
/* console.log(movements); // (8) [200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(movements.includes(-130)); */ // true

// SOME METHOD ise koşulu(condition) test ediyor. Bu koşul eşitlik de olabilir. En az bir öğe sağladığı sürece true.
/* const anyDeposits = movements.some(mov => mov > 0);
console.log(anyDeposits); // true

console.log(movements.some(mov => mov === -130)); */ // true

// EVERY METHOD de koşulu test ediyor ancak bütün öğeler koşulu sağlarsa true döndürüyor.
/* console.log(movements.every(mov => mov > 0)); // false
console.log(account4.movements); // (5) [430, 1000, 700, 50, 90]
console.log(account4.movements.every(mov => mov > 0)); */ // true

// Separate callback
/* const deposit = mov => mov > 0;
console.log(movements.some(deposit)); // true
console.log(movements.every(deposit)); // false
console.log(movements.filter(deposit)); */ // (5) [200, 450, 3000, 70, 1300]

// flat and flatMap

/* const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat()); // (8) [1, 2, 3, 4, 5, 6, 7, 8]

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat()); // (6) [Array(2), 3, 4, Array(2), 7, 8]
console.log(arrDeep.flat().flat()); // (8) [1, 2, 3, 4, 5, 6, 7, 8] ... Bu benim denediğim ama daha kolayı var;
console.log(arrDeep.flat(2)); // (8) [1, 2, 3, 4, 5, 6, 7, 8]

const accountMovements = accounts.map(acc => acc.movements);
console.log(accountMovements);  */
/* (4) [Array(8), Array(8), Array(8), Array(5)]
0: (8) [200, 450, -400, 3000, -650, -130, 70, 1300]
1: (8) [5000, 3400, -150, -790, -3210, -1000, 8500, -30]
2: (8) [200, -200, 340, -300, -20, 50, 400, -460]
3: (5) [430, 1000, 700, 50, 90]
length: 4
[[Prototype]]: Array(0)
*/
/* const allMovements = accountMovements.flat();
console.log(allMovements); */
/* (29) [200, 450, -400, 3000, -650, -130, 70, 1300, 5000, 3400, -150, -790, -3210, -1000, 8500, -30, 200, -200, 340, -300, -20, 50, 400, -460, 430, 1000, 700, 50, 90] */

/* const overallBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
console.log(overallBalance); */ // 17840

/* 
Chaining ile yapsaydık;
const overallBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
*/

// flatMap
/* const overallBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overallBalance2); */ // 17840

// Ancak flatMap işleri kısaltsa da burada, yalnızca 1 seviye derine inebiliyor. Bu yüzden eğer daha derine inilecekse flat kullanılmalı.

// Sort

// Strings
/* const owners = ['Jonas', 'Zech', 'Adam', 'Martha'];
console.log(owners.sort()); // (4) ['Adam', 'Jonas', 'Martha', 'Zech']
//Ancak orijinal array'i de değiştiriyor;
console.log(owners); // (4) ['Adam', 'Jonas', 'Martha', 'Zech']

// Numbers
console.log(movements); */ // (8) [200, 450, -400, 3000, -650, -130, 70, 1300]

// return < 0, A, B (keep order)
// return > 0, B, A (switch order)

// Ascending
/* movements.sort((a, b) => {
  if (a > b) return 1;
  if (b > a) return -1;
});
console.log(movements);  */ // (8) [-650, -400, -130, 70, 200, 450, 1300, 3000]

// 1 veya -1 ifadesi tamamen sembolik. Mevzu pozitif veya negatif olmaları. 'a-b' ifadesi a büyükse pozitif, b büyükse negatif olacağı için direkt ifadeyi böyle kısaltabiliriz;
/* movements.sort((a, b) => a - b);
console.log(movements); */ // // (8) [-650, -400, -130, 70, 200, 450, 1300, 3000]

// Descending
/* movements.sort((a, b) => {
  if (a > b) return -1;
  if (b > a) return 1;
});
console.log(movements); // (8) [3000, 1300, 450, 200, 70, -130, -400, -650]

movements.sort((a, b) => b - a);
console.log(movements);  */ // // (8) [3000, 1300, 450, 200, 70, -130, -400, -650]

/* const arr = [1, 2, 3, 4, 5, 6, 7];

// Empty arrays fill method
const x = new Array(7);
console.log(x); */ // (7) [empty × 7]
/* x.fill(1);
console.log(x); // (7) [1, 1, 1, 1, 1, 1, 1] */

/* x.fill(1, 3, 5); // slice() gibi, giriş veya bitiş parametresi girebiliyorsun
console.log(x); // (7) [empty × 3, 1, 1, empty × 2]

arr.fill(23, 4, 6);
console.log(arr); */ // (7) [1, 2, 3, 4, 23, 23, 7]

// Array.from
/* const y = Array.from({ length: 7 }, () => 1);
console.log(y); // (7) [1, 1, 1, 1, 1, 1, 1]

const z = Array.from({ length: 7 }, (_, i) => i + 1);
console.log(z);  */ // (7) [1, 2, 3, 4, 5, 6, 7]
// Yukardaki call back aynı map() metodundaki gibi. Boş bir dizi üzerinde map metodunu çağırırken bir call back function olarak kullandığımızı düşünebiliriz.

// 100 elemanlı, 1'den 100'e rastgele sayılardan array oluşturup, oluşan array'in ortalamasını bulmak;
/* const k = Array.from({ length: 100 }, () =>
  Math.trunc(Math.random() * 100 + 1)
);
const averageK =
  k.reduce(function (acc, cur) {
    return acc + cur;
  }, 0) / k.length; */

// Array.from aynı zamanda Nodelist'leri Array'e çevirirken işimize yarıyor;

/* labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );

  console.log(movementsUI); // Jonas'ın hesabındayken: (8) [1300, 70, -130, -650, 3000, -400, 450, 200]
}); */

// Array Method Practices

// 1
/* const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, cur) => sum + cur, 0);
console.log(bankDepositSum); */ // 25180

// 2
/* 1. way
  const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov >= 1000).length; */

// 2. way
/* const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? count + 1 : count), 0); 
  Yukarda count++ yaptığımızda ise sonuç 0 geliyor. 
  let a = 10
  console.log(a++); // 10 çünkü. 
  console.log(a); // yaptığımızda şimdi 11 oluyor.
  Bu yüzden ++count yapmalıyız.
  */

/* const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);
console.log(numDeposits1000);  */ // 6

// 3
// Reduce normalde yeni bir value'ye indirgiyordu array'i. Ancak bu value her şey olabilir. Bir object ve hatta array bile olabilir. Bu yüzden reduce'u neredeyse her şey için kullanabiliriz.
/* 
const sums = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(sums); */ // {deposits: 25180, withdrawals: -7340}

//Biraz daha güncelleyelim yukardakini;
/* const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(deposits, withdrawals); */ // 25180 -7340

// 4
// this is a slice title => This Is a Slice Title
/* const convertTitleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);

  const exceptions = [
    'a',
    'an',
    'and',
    'the',
    'but',
    'or',
    'on',
    'in',
    'with',
    'of',
  ];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitalize(word)))
    .join(' ');
  return capitalize(titleCase);
}; */

/* console.log(convertTitleCase('this is a nice title')); // This Is a Nice Title
console.log(convertTitleCase('this is a LONG title but not too long')); // This Is a Long Title but Not Too Long
console.log(convertTitleCase('and here is another title with an EXAMPLE'));  */ // And Here Is Another Title with an Example

// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

GOOD LUCK 😀
*/

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1
dogs.forEach(function (dog) {
  dog.recommendedFood = dog.weight ** 0.75 * 28;
});
console.log(dogs);

// 2
const findSarahDog = function (dogs) {
  const SarahsDog = dogs.find(dog => dog.owners.join(' ').includes('Sarah'));

  console.log(SarahsDog);
};
findSarahDog(dogs);

// 3
