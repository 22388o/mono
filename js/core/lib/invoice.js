class Invoice {
  // Unique identifier for the invoice
  id: string;

  // Timestamp indicating when the invoice was generated
  timestamp: Date;

  // The total amount of the invoice
  amount: number;

  // Network where the invoice transaction occurs
  network: string;

  // Additional field for any extra information
  field: string;

  // Address paying the invoice
  payer: string;

  // Address receiving the payment
  payee: string;

  constructor(
    id: string,
    timestamp: Date,
    amount: number,
    network: string,
    field: string,
    payer: string,
    payee: string
  ) {
    this.id = id;
    this.timestamp = timestamp;
    this.amount = amount;
    this.network = network;
    this.field = field;
    this.payer = payer;
    this.payee = payee;
  }
}

// Example usage:
const myInvoice = new Invoice(
  "hashOfInvoiceHere",
  new Date(),
  21.0,
  "Bitcoin",
  "",
  "AliceAddress",
  "BobAddress"
);

console.log(myInvoice);
