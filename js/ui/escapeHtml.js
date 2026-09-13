// Shared by every screen that interpolates free-text (user-typed or
// cloud-synced) values into innerHTML — previously copy-pasted
// identically into 5 separate files (studyPlan.js, essay.js,
// mistakeJournal.js, flashcardLesson.js, scoreReport.js), found while
// auditing the codebase. Escaping the wrong way in just one of five
// copies is exactly the kind of drift that duplication invites.
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
