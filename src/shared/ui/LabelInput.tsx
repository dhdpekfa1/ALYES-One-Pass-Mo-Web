import React, { forwardRef } from 'react';
import { cn } from '@/shared/lib';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  label?: string;
  labelClassName?: string;
  hasError?: boolean;
  errorMessage?: string;
  LeftIcon?: React.ReactNode;
  RightIcon?: React.ReactNode;
  labelRightContent?: React.ReactNode;
  editable?: boolean;
  required?: boolean;
  hasMessage?: boolean;
  message?: string;
  onPressRightIcon?: () => void;
  onPressLeftIcon?: () => void;
  size?: Size;
};

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  as?: 'input';
};
type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> & {
  as: 'textarea';
};

export type LabelInputProps = (InputProps | TextareaProps) & Props;

export const LabelInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  LabelInputProps
>(
  (
    {
      label,
      labelClassName,
      hasError = false,
      errorMessage = '',
      LeftIcon,
      RightIcon,
      required = false,
      editable = true,
      hasMessage = false,
      message = '',
      onPressRightIcon,
      onPressLeftIcon,
      size = 'md',
      labelRightContent,
      className,
      as = 'input',
      ...rest
    },
    ref,
  ) => {
    const heightClass: string = (() => {
      switch (size) {
        case 'sm':
          return 'h-[36px]';
        case 'md':
          return 'h-[46px]';
        case 'lg':
          return as === 'textarea' ? 'h-[100px] py-2' : 'h-[46px]';
        default:
          return 'h-[46px]';
      }
    })();

    const wrapperClasses = cn(
      'relative mt-1 overflow-hidden flex items-center w-full border rounded-[5px]',
      hasError
        ? 'border-error'
        : 'border-grey-300 focus-within:border-green-500',
      editable ? 'bg-white' : 'bg-grey-100',
    );

    const inputBaseClasses = cn(
      'mid-5 text-grey-800 w-full px-3 placeholder:text-grey-400 bg-transparent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      heightClass,
      LeftIcon ? 'pl-8' : '',
      className,
    );

    return (
      <div className='flex flex-col items-start'>
        {label && (
          <div className='flex w-full items-center justify-between gap-1'>
            <label className={cn('title-5 text-grey-800', labelClassName)}>
              {required && <span className='text-error'>*</span>} {label}
            </label>
            {labelRightContent && <div>{labelRightContent}</div>}
          </div>
        )}

        <div className={wrapperClasses}>
          {LeftIcon && (
            <button
              type='button'
              className='absolute left-2 z-10 h-full flex items-center justify-center'
              onClick={onPressLeftIcon}
            >
              {LeftIcon}
            </button>
          )}

          {as === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              disabled={!editable || (rest as TextareaProps).disabled}
              aria-invalid={hasError || undefined}
              className={inputBaseClasses}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
              disabled={!editable || (rest as InputProps).disabled}
              aria-invalid={hasError || undefined}
              className={inputBaseClasses}
            />
          )}

          {RightIcon && (
            <button
              type='button'
              className='absolute right-2 z-10 h-full flex items-center justify-center'
              onClick={onPressRightIcon}
            >
              {RightIcon}
            </button>
          )}
        </div>

        {hasError && (
          <div className='mt-1'>
            <p className='body-4 text-error'>{errorMessage}</p>
          </div>
        )}
        {hasMessage && (
          <div className='mt-1'>
            <p className='body-4 text-confirm'>{message}</p>
          </div>
        )}
      </div>
    );
  },
);

LabelInput.displayName = 'LabelInput';
