// IN USE. KEEP this
export function calculateEndingBalance(transactions) {
  let balance = 0;

  return transactions
    .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate))
    .map((transaction) => {
      const txAmount = Number(transaction.amount);
      if (transaction.transactionType === "deposit") {
        // balance += transaction.amount;
        balance += txAmount;
      } else {
        // balance -= transaction.amount;
        balance -= txAmount;
      }

      return {
        ...transaction,
        date: transaction.transactionDate, //rename "transactionDate" to "date"
        endBal: balance,
      };
    })
    .reverse();
}
