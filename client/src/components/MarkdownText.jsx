import { cleanMarkdownText, stripLooseMarkdown } from '../helpers/markdown';

function cleanHeadingText(text) {
  return cleanMarkdownText(text).replace(/^\d+\.\s*/, '');
}

function renderInline(text) {
  const parts = text.split(/(\*\*.+?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-gray-100">
          {cleanMarkdownText(part.slice(2, -2))}
        </strong>
      );
    }

    return stripLooseMarkdown(part);
  });
}

export default function MarkdownText({ text }) {
  const lines = (text || '').split('\n');

  return (
    <div className="space-y-3 text-sm leading-7 text-gray-300">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={index} className="h-2" />;

        if (/^-{3,}$/.test(trimmed)) {
          return <div key={index} className="border-t border-base-300" />;
        }

        const heading = trimmed.match(/^#{1,6}\s+(.+)/);
        if (heading) {
          return (
            <h4 key={index} className="pt-2 text-base font-bold text-primary">
              {cleanHeadingText(heading[1])}
            </h4>
          );
        }

        const boldHeading = trimmed.match(/^\*\*(.+?)\*\*:?\s*$/);
        if (boldHeading) {
          return (
            <h4 key={index} className="pt-2 text-base font-bold text-primary">
              {cleanHeadingText(boldHeading[1])}
            </h4>
          );
        }

        const numbered = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (numbered) {
          return (
            <div key={index} className="flex gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {numbered[1]}
              </span>
              <p className="flex-1">{renderInline(numbered[2])}</p>
            </div>
          );
        }

        const bullet = trimmed.match(/^[-*]\s+(.+)/);
        if (bullet) {
          return (
            <div key={index} className="flex gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <p className="flex-1">{renderInline(bullet[1])}</p>
            </div>
          );
        }

        return <p key={index}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}
