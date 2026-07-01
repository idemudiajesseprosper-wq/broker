import Account from "@/models/Account";

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
  const existingAccount = await Account.findOne({ userId });

  if (existingAccount) {
    return existingAccount;
  }

  return Account.create({
    accountNumber: await generateAccountNumber(),
    userId,
  });
}
