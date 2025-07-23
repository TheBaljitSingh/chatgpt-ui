import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateTitle(content: string): string {
  // Extract first sentence or first 50 characters
  const firstSentence = content.split('.')[0];
  if (firstSentence.length > 50) {
    return firstSentence.substring(0, 50) + '...';
  }
  return firstSentence || 'New Chat';
}

export function truncateMessage(message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function extractCodeFromMessage(message: string): string[] {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const matches = message.match(codeBlockRegex);
  return matches || [];
}

export function removeCodeBlocks(message: string): string {
  return message.replace(/```[\s\S]*?```/g, '[code block]');
}