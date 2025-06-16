/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import React, { useState, useEffect } from 'react';
import {
  validateEmail,
  getEmailValidationClass,
  EmailValidationResult,
} from '@/utils/validation/emailValidator';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailValidationFeedbackProps {
  email: string;
  showWhenEmpty?: boolean;
  className?: string;
}

/**
 * Email validation feedback component
 * Shows real-time feedback on email validity with appropriate icons and messages
 */
const EmailValidationFeedback: React.FC<EmailValidationFeedbackProps> = ({
  email,
  showWhenEmpty = false,
  className,
}) => {
  const [validation, setValidation] = useState<EmailValidationResult>({
    isValid: false,
    isDisposable: false,
    message: '',
    status: 'invalid',
  });

  // Update validation when email changes
  useEffect(() => {
    if (!email && !showWhenEmpty) {
      setValidation({
        isValid: false,
        isDisposable: false,
        message: '',
        status: 'invalid',
      });
      return;
    }

    const result = validateEmail(email);
    setValidation(result);
  }, [email, showWhenEmpty]);

  // Don't show anything if email is empty and showWhenEmpty is false
  if (!email && !showWhenEmpty) {
    return null;
  }

  // Determine icon based on validation status
  const renderIcon = () => {
    switch (validation.status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />;
      case 'invalid':
      case 'disposable':
        return <XCircle className="h-4 w-4 mr-1 text-red-600 dark:text-red-400" />;
      case 'suspicious':
        return <AlertCircle className="h-4 w-4 mr-1 text-amber-600 dark:text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center text-xs mt-1',
        getEmailValidationClass(validation.status),
        className
      )}
    >
      {renderIcon()}
      <span>{validation.message}</span>
    </div>
  );
};

export default EmailValidationFeedback;
