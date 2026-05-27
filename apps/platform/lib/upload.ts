const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
];

const MAX_SIZE = 10 * 1024 * 1024;

export type UploadResult = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mime: string;
  width: number | null;
  height: number | null;
};

export type UploadProgress = {
  phase: 'presign' | 'uploading' | 'confirming' | 'done' | 'error';
  percent: number;
  error?: string;
};

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `不支持的文件类型: ${file.type}`;
  }
  if (file.size > MAX_SIZE) {
    return `文件大小超过 10MB 限制`;
  }
  return null;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadFile(
  file: File,
  options?: { slideId?: string; onProgress?: (p: UploadProgress) => void },
): Promise<UploadResult> {
  const { slideId, onProgress } = options ?? {};
  const report = (p: UploadProgress) => onProgress?.(p);

  const error = validateFile(file);
  if (error) {
    report({ phase: 'error', percent: 0, error });
    throw new Error(error);
  }

  report({ phase: 'presign', percent: 0 });
  const dims = await getImageDimensions(file);

  const presignRes = await fetch('/api/assets/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      mime: file.type,
      size: file.size,
      slideId,
      width: dims?.width ?? null,
      height: dims?.height ?? null,
    }),
  });
  if (!presignRes.ok) {
    const msg = (await presignRes.json()).error ?? '获取上传凭证失败';
    report({ phase: 'error', percent: 0, error: msg });
    throw new Error(msg);
  }
  const { uploadUrl, assetId } = await presignRes.json();

  report({ phase: 'uploading', percent: 10 });
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!putRes.ok) {
    report({ phase: 'error', percent: 50, error: '上传至存储失败' });
    throw new Error('上传至存储失败');
  }

  report({ phase: 'confirming', percent: 80 });
  const confirmRes = await fetch('/api/assets/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetId }),
  });
  if (!confirmRes.ok) {
    report({ phase: 'error', percent: 90, error: '确认上传失败' });
    throw new Error('确认上传失败');
  }

  const result: UploadResult = await confirmRes.json();
  report({ phase: 'done', percent: 100 });
  return result;
}
