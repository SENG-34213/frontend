export function downloadFile(url: string, filename?: string) {
  if (!url) throw new Error("A download URL is required.");

  const link = document.createElement("a");
  link.href = url;
  if (filename) link.download = filename;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
