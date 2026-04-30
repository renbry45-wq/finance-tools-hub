// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Social share — same behavior as legacy inline shareUrl()
function shareUrl(platform, title) {
  const url = window.location.href;
  const text = title + ' - Finance Tools Hub 2026';
  let share = '';
  if (platform === 'X')        share = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  if (platform === 'Facebook') share = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  if (platform === 'LinkedIn') share = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  if (platform === 'WhatsApp') share = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
  if (share) window.open(share, '_blank');
}

// PDF export — uses the jsPDF UMD bundle loaded in the layout
function downloadResultPDF(title, result) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(18);
  doc.text(title, 16, y);
  y += 10;
  doc.setFontSize(11);
  Object.entries(result).forEach(([k, v]) => {
    doc.text(`${k}: ${String(v)}`, 16, y);
    y += 8;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.save(title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.pdf');
}

// Email mailto: prefilled with formatted result
function emailResult(title, result) {
  const body = title + '\n\n' + Object.entries(result).map(([k, v]) => `${k}: ${v}`).join('\n');
  window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

// Expose globally for onclick handlers in legacy calculator markup
window.shareUrl = shareUrl;
window.downloadResultPDF = downloadResultPDF;
window.emailResult = emailResult;
