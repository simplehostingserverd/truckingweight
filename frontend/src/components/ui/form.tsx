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

'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useFormField = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fieldContext = React.useContext(FormFieldContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const itemContext = React.useContext(FormItemContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { getFieldState, formState } = useFormContext();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-[0.8rem] text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { error, formMessageId } = useFormField();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const body = error ? String(error?.message ?? '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-[0.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
