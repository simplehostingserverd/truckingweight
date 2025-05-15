/**
 * Email Validation Utility
 * 
 * Provides comprehensive email validation including:
 * - Basic format validation
 * - Temporary/disposable email domain detection
 * - Domain validation
 */

// Regular expression for basic email format validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// List of common disposable/temporary email domains
// This list can be expanded as needed
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.com',
  'throwawaymail.com',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.info',
  'guerrillamail.biz',
  'guerrillamail.org',
  'sharklasers.com',
  'grr.la',
  'getairmail.com',
  'yopmail.com',
  'tempinbox.com',
  'fakeinbox.com',
  'mailnesia.com',
  'mailcatch.com',
  'dispostable.com',
  'mintemail.com',
  'tempmailer.com',
  'trash-mail.com',
  'mytrashmail.com',
  'mailnull.com',
  'incognitomail.com',
  'spamobox.com',
  'trashmail.com',
  'tempr.email',
  'temp-mail.org',
  'disposable-email.com',
  'emailondeck.com',
  'spamgourmet.com',
  'getnada.com',
  'temp-mail.io',
  'fakemailgenerator.com',
  'emailfake.com',
  'tempmail.ninja',
  'mohmal.com',
  'tempmail.plus',
  'maildrop.cc',
  'harakirimail.com',
  'mailsac.com',
  'inboxalias.com',
  'tempmailaddress.com',
  'discard.email',
  'mailbox.org',
  'temp-mail.ru',
  'throwawaymail.com',
  'tempmail.space',
  'burnermail.io',
  'trashmail.ws',
  'spamex.com',
  'jetable.org',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'dodgit.com',
  'spambog.com',
  'spambog.de',
  'spambog.ru',
  'discardmail.com',
  'discardmail.de',
  'spamfree24.org',
  'spamfree24.de',
  'spamfree24.eu',
  'spamfree24.info',
  'spamfree24.com',
  'spamfree.eu',
  'tempail.com',
  'tempemail.net',
  'tempemail.co.za',
  'tempinbox.co.uk',
  'tempinbox.com',
  'tempm.com',
  'temp-mail.com',
  'throwmail.com',
  'trashmail.net',
  'trashmail.ws',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'mailcatch.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'temporary-mail.net',
  'tempmail.it',
  'tmailinator.com',
  'mailexpire.com',
  'cs.email',
  'altmails.com',
  'fakemail.net',
  'mailnull.com',
  'mailmetrash.com',
  'email-fake.com',
  'emailfake.com',
  'throwam.com',
  'throwawayemail.com',
];

/**
 * Email validation result with detailed information
 */
export interface EmailValidationResult {
  isValid: boolean;
  isDisposable: boolean;
  message: string;
  status: 'valid' | 'invalid' | 'disposable' | 'suspicious';
}

/**
 * Validates an email address with comprehensive checks
 * @param email The email address to validate
 * @returns Validation result with detailed information
 */
export const validateEmail = (email: string): EmailValidationResult => {
  // Trim the email to remove any whitespace
  const trimmedEmail = email.trim();
  
  // Check if email is empty
  if (!trimmedEmail) {
    return {
      isValid: false,
      isDisposable: false,
      message: 'Email is required',
      status: 'invalid',
    };
  }
  
  // Check basic format using regex
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      isDisposable: false,
      message: 'Invalid email format',
      status: 'invalid',
    };
  }
  
  // Extract domain from email
  const domain = trimmedEmail.split('@')[1].toLowerCase();
  
  // Check if domain is in the list of disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      isDisposable: true,
      message: 'Temporary or disposable email addresses are not allowed',
      status: 'disposable',
    };
  }
  
  // Check for suspicious patterns in the domain or username
  const username = trimmedEmail.split('@')[0].toLowerCase();
  
  // Check for random-looking usernames (many consecutive consonants or numbers)
  const hasRandomPattern = /[bcdfghjklmnpqrstvwxz]{5,}/.test(username) || 
                          /\d{5,}/.test(username) ||
                          /[^\w.-]/.test(username);
  
  if (hasRandomPattern) {
    return {
      isValid: true, // Still technically valid
      isDisposable: false,
      message: 'This email looks suspicious, please verify',
      status: 'suspicious',
    };
  }
  
  // All checks passed
  return {
    isValid: true,
    isDisposable: false,
    message: 'Email is valid',
    status: 'valid',
  };
};

/**
 * Get CSS class based on email validation status
 * @param status Email validation status
 * @returns CSS class name
 */
export const getEmailValidationClass = (status: EmailValidationResult['status']): string => {
  switch (status) {
    case 'valid':
      return 'text-green-600 dark:text-green-400';
    case 'invalid':
    case 'disposable':
      return 'text-red-600 dark:text-red-400';
    case 'suspicious':
      return 'text-amber-600 dark:text-amber-400';
    default:
      return '';
  }
};

export default validateEmail;
