'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

const FilerobotImageEditor = dynamic(() => import('react-filerobot-image-editor'), {
  ssr: false,
});

type ImageEditorModalProps = {
  imageUrl: string;
  filename: string;
  onSave: (editedBlob: Blob, filename: string) => void;
  onClose: () => void;
};

export function ImageEditorModal({ imageUrl, filename, onSave, onClose }: ImageEditorModalProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(
    (editedImageObject: { imageBase64?: string; fullName?: string }) => {
      if (!editedImageObject.imageBase64) return;
      setSaving(true);

      const base64 = editedImageObject.imageBase64.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      const name = editedImageObject.fullName || filename;

      onSave(blob, name);
      setSaving(false);
    },
    [filename, onSave],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative h-[85vh] w-[90vw] overflow-hidden rounded-xl bg-white">
        {saving && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <span className="text-sm text-neutral-500">保存中…</span>
          </div>
        )}
        <FilerobotImageEditor
          source={imageUrl}
          onSave={(editedImageObject: unknown) =>
            handleSave(editedImageObject as { imageBase64?: string; fullName?: string })
          }
          onClose={onClose}
          annotationsCommon={{ fill: '#ff0000' }}
          Crop={{ presetsItems: [] }}
          tabsIds={['Adjust', 'Annotate', 'Filters', 'Resize']}
          defaultTabId="Adjust"
          savingPixelRatio={2}
          previewPixelRatio={2}
        />
      </div>
    </div>
  );
}
