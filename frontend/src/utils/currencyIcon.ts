function currencyIcon(value: string) {
  if (value === "INR") return "₹ ";
  else if (value === "USD") return "$ ";
  else return "£ ";
}

export default currencyIcon