'use client';

import { useCallback, useRef, useState } from 'react';
import type { EditOperation } from '@/lib/edit-ops/types';

type UseEditHistoryOptions = {
  slideId: string;
  initialSource: string;
  onSourceChange: (source: string) => void;
};

export function useEditHistory({ slideId, initialSource, onSourceChange }: UseEditHistoryOptions) {
  const [operations, setOperations] = useState<EditOperation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const sourceRef = useRef(initialSource);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < operations.length - 1;

  const pushOperation = useCallback(
    (op: EditOperation) => {
      setOperations((prev) => {
        const trimmed = prev.slice(0, currentIndex + 1);
        return [...trimmed, op];
      });
      setCurrentIndex((prev) => prev + 1);
      sourceRef.current = op.sourceAfter;
      onSourceChange(op.sourceAfter);
    },
    [currentIndex, onSourceChange],
  );

  const undo = useCallback(async () => {
    if (!canUndo) return;
    const op = operations[currentIndex];
    const res = await fetch('/api/edit-ops/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideId, source: op.sourceBefore }),
    });
    if (res.ok) {
      setCurrentIndex((prev) => prev - 1);
      sourceRef.current = op.sourceBefore;
      onSourceChange(op.sourceBefore);
    }
  }, [canUndo, currentIndex, operations, slideId, onSourceChange]);

  const redo = useCallback(async () => {
    if (!canRedo) return;
    const op = operations[currentIndex + 1];
    const res = await fetch('/api/edit-ops/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideId, source: op.sourceAfter }),
    });
    if (res.ok) {
      setCurrentIndex((prev) => prev + 1);
      sourceRef.current = op.sourceAfter;
      onSourceChange(op.sourceAfter);
    }
  }, [canRedo, currentIndex, operations, slideId, onSourceChange]);

  return { operations, currentIndex, canUndo, canRedo, pushOperation, undo, redo };
}
