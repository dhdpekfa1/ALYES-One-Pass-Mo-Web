import * as React from 'react';
import { cn } from '@/shared/lib';
import { ChevronRightSvg } from '@/shared/assets/icons';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'grey_outline'
  | 'error'
  | 'underline'
  | 'arrow';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface Props
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'title'
  > {
  title: string | React.ReactNode;
  size: ButtonSize;
  variant: ButtonVariant; // type
  onPress: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  ArrowIcon?: React.ReactNode;
  buttonType?: 'button' | 'submit' | 'reset';
}

function getTextColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) return 'text-grey-500';
  switch (variant) {
    case 'primary':
    case 'quaternary':
      return 'text-white';
    case 'secondary':
    case 'tertiary':
      return 'text-green-700';
    case 'underline':
    case 'arrow':
      return 'text-grey-500';
    case 'error':
      return 'text-white';
    default:
      return 'text-foreground';
  }
}

function getTextSize(size: ButtonSize, variant: ButtonVariant): string {
  if (size === 'sm' || size === 'md') return 'title-5';
  if (variant === 'arrow' || variant === 'underline') return 'mid-5';
  return 'title-6';
}

function getBackgroundClasses(
  variant: ButtonVariant,
  disabled: boolean,
): string {
  if (disabled) return 'bg-grey-200';
  switch (variant) {
    case 'primary':
      return 'bg-green-500';
    case 'secondary':
      return 'bg-green-300';
    case 'quaternary':
      return 'bg-grey-300';
    case 'tertiary':
      return 'bg-white border border-green-600 rounded-[5px]';
    case 'grey_outline':
      return 'bg-white border border-grey-100 rounded-[5px]';
    case 'error':
      return 'bg-error';
    case 'arrow':
      return 'bg-white';
    default:
      return '';
  }
}

function getHeightClass(size: ButtonSize): string {
  switch (size) {
    case 'sm':
      return 'h-[34px]';
    case 'md':
      return 'h-[40px]';
    case 'lg':
      return 'h-[46px]';
    case 'xl':
      return 'h-[54px]';
    default:
      return 'h-[40px]';
  }
}

export function Button({
  title,
  size,
  variant,
  disabled = false,
  onPress,
  style,
  ArrowIcon,
  className,
  onClick,
  buttonType = 'button',
  ...props
}: Props) {
  const textColor = getTextColor(variant, disabled);
  const textSize = getTextSize(size, variant);
  const bgClasses = getBackgroundClasses(variant, disabled);
  const heightClass = getHeightClass(size);
  const underlineClasses =
    variant === 'underline'
      ? 'underline underline-offset-[2px] decoration-grey-500'
      : '';

  return (
    <button
      data-slot='button'
      className={cn(
        'w-full inline-flex items-center justify-center rounded-[5px] px-4 transition-all disabled:pointer-events-none disabled:opacity-50 active:opacity-75',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        heightClass,
        bgClasses,
        className,
      )}
      style={style}
      disabled={disabled}
      type={buttonType}
      onClick={e => {
        onClick?.(e);
        onPress?.();
      }}
      {...props}
    >
      <span
        className={cn(
          'flex items-center justify-center',
          variant === 'arrow' ? 'gap-1.5' : '',
        )}
      >
        {typeof title === 'string' ? (
          <span className={cn(textColor, textSize, underlineClasses)}>
            {title}
          </span>
        ) : (
          title
        )}
        {/* {variant === 'underline' && (
          <span className='block w-full h-px bg-grey-500 -mt-0.5' />
        )} */}
        {variant === 'arrow' &&
          (ArrowIcon ?? <ChevronRightSvg width={20} height={20} />)}
      </span>
    </button>
  );
}
