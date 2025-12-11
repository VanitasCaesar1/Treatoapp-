/*
 * Input Sanitization Utilities
 *
 * XSS is still a thing. React helps with its automatic escaping,
 * but dangerouslySetInnerHTML exists and people use it.
 * Don't trust user input. Ever.
 *
 * These functions sanitize input for different contexts:
 * - HTML content (for rich text)
 * - Plain text (for display)
 * - Filenames (for uploads)
 * - URLs (for links)
 */

/*
 * sanitizeHtml - Clean HTML content for safe rendering
 *
 * Uses a whitelist approach - only allows specific tags and attributes.
 * Everything else is stripped.
 *
 * For full HTML sanitization, consider using DOMPurify library.
 * This is a lightweight alternative for simple cases.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';

  /*
   * Allowed tags - add more as needed, but be conservative.
   * Each tag you allow is a potential attack vector.
   */
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'];

  /*
   * Remove script tags and their content first.
   * This is the most dangerous - always remove.
   */
  let clean = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  /*
   * Remove event handlers (onclick, onerror, etc.)
   * These can execute JavaScript.
   */
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  /*
   * Remove javascript: URLs
   */
  clean = clean.replace(/javascript:/gi, '');

  /*
   * Remove data: URLs (can contain executable content)
   */
  clean = clean.replace(/data:/gi, '');

  /*
   * Strip tags not in whitelist
   * This is a simple approach - for production, use a proper parser
   */
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  clean = clean.replace(tagRegex, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      /*
       * For allowed tags, strip all attributes except href on <a>
       */
      if (tag.toLowerCase() === 'a') {
        const hrefMatch = match.match(/href\s*=\s*["']([^"']*)["']/i);
        if (hrefMatch && isValidUrl(hrefMatch[1])) {
          return `<a href="${escapeHtml(hrefMatch[1])}" rel="noopener noreferrer">`;
        }
        return '<a>';
      }
      return `<${match.startsWith('</') ? '/' : ''}${tag}>`;
    }
    return '';
  });

  return clean;
}

/*
 * sanitizeText - Remove all HTML and dangerous characters
 *
 * Use this for plain text display where no HTML is expected.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return input
    /* Remove all HTML tags */
    .replace(/<[^>]*>/g, '')
    /* Remove null bytes */
    .replace(/\0/g, '')
    /* Normalize whitespace */
    .replace(/\s+/g, ' ')
    /* Trim */
    .trim()
    /* Limit length - adjust as needed */
    .slice(0, 10000);
}

/*
 * sanitizeFilename - Make a filename safe for storage
 *
 * Removes path traversal attempts and special characters.
 * The result is safe to use as a filename on any OS.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed';

  return filename
    /* Remove path separators */
    .replace(/[\/\\]/g, '')
    /* Remove null bytes */
    .replace(/\0/g, '')
    /* Replace special characters with underscore */
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    /* Remove leading dots (hidden files) */
    .replace(/^\.+/, '')
    /* Collapse multiple underscores */
    .replace(/_+/g, '_')
    /* Limit length */
    .slice(0, 255)
    /* Ensure not empty */
    || 'unnamed';
}

/*
 * escapeHtml - Escape HTML special characters
 *
 * Use this when inserting user content into HTML context.
 * React does this automatically for JSX, but you might need it
 * for other cases.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return str.replace(/[&<>"'`=\/]/g, (char) => escapeMap[char]);
}

/*
 * isValidUrl - Check if a URL is safe
 *
 * Rejects javascript:, data:, and other dangerous protocols.
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    /* Only allow http and https */
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    /* Relative URLs are okay */
    return url.startsWith('/') && !url.startsWith('//');
  }
}

/*
 * sanitizeUrl - Make a URL safe for use in href
 *
 * Returns empty string for dangerous URLs.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  /* Remove whitespace and control characters */
  const cleaned = url.trim().replace(/[\x00-\x1f\x7f]/g, '');

  /* Check for dangerous protocols */
  const lower = cleaned.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '';
  }

  return cleaned;
}

/*
 * sanitizeSearchQuery - Clean search input
 *
 * Removes characters that could cause issues in search queries.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';

  return query
    /* Remove special regex characters */
    .replace(/[.*+?^${}()|[\]\\]/g, '')
    /* Remove SQL-like operators */
    .replace(/['";]/g, '')
    /* Normalize whitespace */
    .replace(/\s+/g, ' ')
    .trim()
    /* Limit length */
    .slice(0, 200);
}

/*
 * sanitizePhoneNumber - Clean phone number input
 *
 * Keeps only digits, plus sign, and common separators.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';

  return phone
    /* Keep only valid phone characters */
    .replace(/[^\d+\-\s()]/g, '')
    /* Collapse multiple spaces */
    .replace(/\s+/g, ' ')
    .trim();
}

/*
 * sanitizeEmail - Clean email input
 *
 * Lowercases and removes dangerous characters.
 * Does NOT validate - use a proper validator for that.
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  return email
    .toLowerCase()
    .trim()
    /* Remove characters not valid in emails */
    .replace(/[^a-z0-9._%+\-@]/g, '')
    .slice(0, 254);
}
