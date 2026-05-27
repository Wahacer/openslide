const MARKER_RE =
  /\{\/\*\s*@slide-comment\s+id="(c-[a-f0-9]+)"\s+ts="([^"]+)"\s+text="([A-Za-z0-9_-]+={0,2})"\s*\*\/\}/g;

export type Comment = {
  id: string;
  line: number;
  ts: string;
  note: string;
  hint?: string;
};

function b64urlDecode(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(pad), 'base64').toString('utf-8');
}

export function parseComments(source: string): Comment[] {
  const comments: Comment[] = [];
  const lines = source.split('\n');

  for (let i = 0; i < lines.length; i++) {
    MARKER_RE.lastIndex = 0;
    let match = MARKER_RE.exec(lines[i]);
    while (match !== null) {
      try {
        const payload = JSON.parse(b64urlDecode(match[3]));
        comments.push({
          id: match[1],
          line: i + 1,
          ts: match[2],
          note: payload.note ?? '',
          hint: payload.hint,
        });
      } catch {}
      match = MARKER_RE.exec(lines[i]);
    }
  }

  return comments;
}

export function stripCommentMarkers(source: string, ids: string[]): string {
  let result = source;
  for (const id of ids) {
    const re = new RegExp(`\\s*\\{/\\*\\s*@slide-comment\\s+id="${id}"[^*]*\\*/\\}`, 'g');
    result = result.replace(re, '');
  }
  return result.replace(/\n{3,}/g, '\n\n');
}
