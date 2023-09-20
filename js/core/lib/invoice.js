interface InvoiceProps {
  id: string;
  timestamp: Date;
  amount: number;
  network: string;
  field: string;
  payer: string;
  payee: string;
}

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

  constructor(props: InvoiceProps) {
    this.id = props.id;
    this.timestamp = props.timestamp;
    this.amount = props.amount;
    this.network = props.network;
    this.field = props.field;
    this.payer = props.payer;
    this.payee = props.payee;
  }
}

// Example usage:
const myInvoice = new Invoice({
  id: "hashOfInvoiceHere",
  timestamp: new Date(),
  amount: 21.0,
  network: "Bitcoin",
  field: "",
  payer: "AliceAddress",
  payee: "BobAddress"
});

console.log(myInvoice);
