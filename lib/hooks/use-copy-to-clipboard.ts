'use client';

import { useState } from 'react';
import { showToast } from '@/lib/utils/toast';

/**
 * Copy text to clipboard with feedback
 */
export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = async (text: string, successMessage = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      showToast.success(successMessage, 'clipboard-success');
      
      // Reset after 2 seconds
      setTimeout(() => setCopiedText(null), 2000);
      
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast.error('Failed to copy', 'clipboard-error');
      return false;
    }
  };

  return { copy, copiedText };
}
