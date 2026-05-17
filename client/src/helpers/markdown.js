export function cleanMarkdownText(text = '') {
  return text
    .replace(/^#{1,6}\s*/, '')
    .replace(/^\s*[-*]\s+/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .trim();
}

export function stripLooseMarkdown(text = '') {
  return text.replace(/#+\s*/g, '').replace(/\*/g, '').replace(/`/g, '');
}

export function toPlainMarkdownText(text = '') {
  return text
    .split('\n')
    .map((line) => cleanMarkdownText(line).replace(/^-{3,}$/, ''))
    .filter(Boolean)
    .join('\n');
}
