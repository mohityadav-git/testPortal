const escapeHtml = (value) => {
  const raw = value == null ? "" : String(value);
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatRichText = (value) => {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<u>$1</u>");
};

const toDangerousHtml = (value) => ({ __html: formatRichText(value) });

export { formatRichText, toDangerousHtml };
