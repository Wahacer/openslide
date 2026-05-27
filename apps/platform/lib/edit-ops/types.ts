export type EditOpType =
  | 'set-style'
  | 'set-text'
  | 'insert-element'
  | 'delete-element'
  | 'replace-source';

export type SetStyleOp = {
  type: 'set-style';
  selector: string;
  property: string;
  value: string;
};

export type SetTextOp = {
  type: 'set-text';
  selector: string;
  text: string;
};

export type InsertElementOp = {
  type: 'insert-element';
  parentSelector: string;
  position: 'before' | 'after' | 'first-child' | 'last-child';
  jsx: string;
};

export type DeleteElementOp = {
  type: 'delete-element';
  selector: string;
};

export type ReplaceSourceOp = {
  type: 'replace-source';
  source: string;
};

export type EditOp = SetStyleOp | SetTextOp | InsertElementOp | DeleteElementOp | ReplaceSourceOp;

export type EditOperation = {
  id: string;
  timestamp: number;
  ops: EditOp[];
  description: string;
  sourceBefore: string;
  sourceAfter: string;
};

export type EditHistory = {
  operations: EditOperation[];
  currentIndex: number;
};
