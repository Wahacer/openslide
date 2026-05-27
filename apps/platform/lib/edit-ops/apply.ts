import type { EditOp, EditOperation } from './types';

function generateId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applySetStyle(
  source: string,
  op: { selector: string; property: string; value: string },
): string {
  const camelProp = op.property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  const selectorRegex = new RegExp(
    `(<[^>]*(?:className|id|data-id)=["'][^"']*${escapeRegex(op.selector)}[^"']*["'][^>]*style=\\{\\{)([^}]*)(\\}\\})`,
    'g',
  );
  const match = selectorRegex.exec(source);
  if (match) {
    const styleContent = match[2];
    const propRegex = new RegExp(`${camelProp}\\s*:\\s*['"][^'"]*['"]`);
    let newStyle: string;
    if (propRegex.test(styleContent)) {
      newStyle = styleContent.replace(propRegex, `${camelProp}: '${op.value}'`);
    } else {
      newStyle = styleContent.trimEnd();
      if (newStyle && !newStyle.endsWith(',')) newStyle += ',';
      newStyle += ` ${camelProp}: '${op.value}'`;
    }
    return (
      source.slice(0, match.index) +
      match[1] +
      newStyle +
      match[3] +
      source.slice(match.index + match[0].length)
    );
  }
  return source;
}

function applySetText(source: string, op: { selector: string; text: string }): string {
  const pattern = new RegExp(
    `(<[^>]*(?:className|id|data-id)=["'][^"']*${escapeRegex(op.selector)}[^"']*["'][^>]*>)([^<]*)(</[^>]+>)`,
  );
  return source.replace(pattern, `$1${op.text}$3`);
}

function applyInsertElement(
  source: string,
  op: { parentSelector: string; position: string; jsx: string },
): string {
  const pattern = new RegExp(
    `(<[^>]*(?:className|id|data-id)=["'][^"']*${escapeRegex(op.parentSelector)}[^"']*["'][^>]*>)`,
  );
  const match = pattern.exec(source);
  if (!match) return source;

  if (op.position === 'first-child' || op.position === 'last-child') {
    const openTag = match[1];
    const openEnd = match.index + openTag.length;
    const tagName = openTag.match(/<(\w+)/)?.[1] ?? 'div';
    const closeTag = `</${tagName}>`;
    const closeIdx = source.indexOf(closeTag, openEnd);
    if (closeIdx === -1) return source;

    if (op.position === 'first-child') {
      return `${source.slice(0, openEnd)}\n${op.jsx}${source.slice(openEnd)}`;
    }
    return `${source.slice(0, closeIdx)}${op.jsx}\n${source.slice(closeIdx)}`;
  }

  if (op.position === 'before') {
    return `${source.slice(0, match.index)}${op.jsx}\n${source.slice(match.index)}`;
  }
  const openTag = match[1];
  const openEnd = match.index + openTag.length;
  const tagName = openTag.match(/<(\w+)/)?.[1] ?? 'div';
  const closeTag = `</${tagName}>`;
  const closeIdx = source.indexOf(closeTag, openEnd);
  if (closeIdx === -1) return source;
  const afterClose = closeIdx + closeTag.length;
  return `${source.slice(0, afterClose)}\n${op.jsx}${source.slice(afterClose)}`;
}

function applyDeleteElement(source: string, op: { selector: string }): string {
  const pattern = new RegExp(
    `<([\\w]+)[^>]*(?:className|id|data-id)=["'][^"']*${escapeRegex(op.selector)}[^"']*["'][^>]*/?>`,
  );
  const match = pattern.exec(source);
  if (!match) return source;

  if (match[0].endsWith('/>')) {
    return source.slice(0, match.index) + source.slice(match.index + match[0].length);
  }

  const tagName = match[1];
  const closeTag = `</${tagName}>`;
  let depth = 1;
  let pos = match.index + match[0].length;
  const openPattern = new RegExp(`<${tagName}[\\s>]`, 'g');
  const closePattern = new RegExp(closeTag, 'g');

  while (depth > 0 && pos < source.length) {
    openPattern.lastIndex = pos;
    closePattern.lastIndex = pos;
    const nextOpen = openPattern.exec(source);
    const nextClose = closePattern.exec(source);
    if (!nextClose) break;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      pos = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      pos = nextClose.index + nextClose[0].length;
    }
  }
  return source.slice(0, match.index) + source.slice(pos);
}

export function applyEditOps(source: string, ops: EditOp[]): string {
  let result = source;
  for (const op of ops) {
    switch (op.type) {
      case 'set-style':
        result = applySetStyle(result, op);
        break;
      case 'set-text':
        result = applySetText(result, op);
        break;
      case 'insert-element':
        result = applyInsertElement(result, op);
        break;
      case 'delete-element':
        result = applyDeleteElement(result, op);
        break;
      case 'replace-source':
        result = op.source;
        break;
    }
  }
  return result;
}

export function createEditOperation(
  ops: EditOp[],
  description: string,
  sourceBefore: string,
  sourceAfter: string,
): EditOperation {
  return {
    id: generateId(),
    timestamp: Date.now(),
    ops,
    description,
    sourceBefore,
    sourceAfter,
  };
}
