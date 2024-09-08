// generate a random 6 digit invoice number

export default function invoiceNumberGenerator(): string {
    // Generate a random 6-digit number
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString();
}
