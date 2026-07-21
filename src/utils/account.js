import { randomInt } from "node:crypto";
import Account from "@/models/Account";

const PIN_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PIN_DIGITS = "23456789";
const PIN_CHARACTERS = `${PIN_LETTERS}${PIN_DIGITS}`;

function randomCharacter(characters) {
  return characters[randomInt(characters.length)];
}

export async function generateWithdrawalPin() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const characters = [
      randomCharacter(PIN_LETTERS),
      randomCharacter(PIN_DIGITS),
      ...Array.from({ length: 6 }, () => randomCharacter(PIN_CHARACTERS)),
    ];

    for (let index = characters.length - 1; index > 0; index -= 1) {
      const target = randomInt(index + 1);
      [characters[index], characters[target]] = [
        characters[target],
        characters[index],
      ];
    }

    const withdrawalPin = characters.join("");
    const existingAccount = await Account.exists({ withdrawalPin });

    if (!existingAccount) {
      return withdrawalPin;
    }
  }

  throw new Error("Unable to generate withdrawal PIN");
}

export async function ensureWithdrawalPin(account) {
  if (!account.withdrawalPin) {
    account.withdrawalPin = await generateWithdrawalPin();
    await account.save();
  }

  return account;
}

export async function generateAccountNumber() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const digits = Math.floor(10000000 + Math.random() * 90000000);
    const accountNumber = `BTC${digits}`;
    const existingAccount = await Account.findOne({ accountNumber });

    if (!existingAccount) {
      return accountNumber;
    }
  }

  throw new Error("Unable to generate account number");
}

export async function createAccountForUser(userId) {
  const existingAccount = await Account.findOne({ userId }).select(
    "+withdrawalPin",
  );

  if (existingAccount) {
    return ensureWithdrawalPin(existingAccount);
  }

  return Account.create({
    accountNumber: await generateAccountNumber(),
    userId,
    withdrawalPin: await generateWithdrawalPin(),
  });
}
