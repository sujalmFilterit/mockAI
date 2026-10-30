import { config } from './config';
export function validateResume(file: {
  name: string;
  size: number;
  type: string;
}): string | null {
  const extension = file.name.toLowerCase().split('.').pop();
  if (!['pdf', 'docx'].includes(extension ?? ''))
    return 'Upload a PDF or DOCX file.';
  if (file.size === 0) return 'The file is empty.';
  if (file.size > config.maxFileBytes) return 'File must be 5 MB or smaller.';
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
    '',
  ];
  if (!allowed.includes(file.type)) return 'Unsupported file type.';
  if (
    extension === 'pdf' &&
    file.type &&
    !['application/pdf', 'application/octet-stream'].includes(file.type)
  )
    return 'File type does not match its extension.';
  if (extension === 'docx' && file.type === 'application/pdf')
    return 'File type does not match its extension.';
  return null;
}
