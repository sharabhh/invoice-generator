export default async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Text copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy text:", err);
  }
}
