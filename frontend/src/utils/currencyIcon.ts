function currencyIcon(value: string) {
  if (value === "INR") return "₹ ";
  else if (value === "USD") return "$ ";
  else if(value === "EUR") return "£ ";
}

export default currencyIcon