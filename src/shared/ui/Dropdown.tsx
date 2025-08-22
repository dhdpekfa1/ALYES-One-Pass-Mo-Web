import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/shared/lib';
import { ChevronDownSvg, CircleOkSvg } from '@/shared/assets/icons';

type Props = {
  items: string[];
  selectedItem: string | string[];
  multiple?: boolean;
  description?: string;
  placeholder?: string;
  height?: number;
  onSelect: (item: string) => void;
  listEmptyText?: string;
  onEndReached?: () => void;
  hasNextPage?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  label?: string;
  labelRightContent?: React.ReactNode;
  bottomDescription?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
};

export const Dropdown: React.FC<Props> = ({
  items,
  selectedItem,
  multiple = false,
  placeholder = '선택',
  height = 400,
  onSelect,
  listEmptyText = '현재 선택 가능한 항목이 없습니다.',
  onEndReached,
  hasNextPage,
  hasError,
  errorMessage,
  label,
  labelRightContent,
  bottomDescription,
  disabled,
  size = 'md',
}) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isSelected = useCallback(
    (item: string) =>
      Array.isArray(selectedItem)
        ? (selectedItem as string[]).includes(item)
        : selectedItem === item,
    [selectedItem],
  );

  const displayText = useMemo(() => {
    if (Array.isArray(selectedItem)) {
      return selectedItem.length > 0 ? selectedItem.join(', ') : placeholder;
    }
    return selectedItem || placeholder;
  }, [placeholder, selectedItem]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const heightStyle: React.CSSProperties = { maxHeight: height };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || !onEndReached) return;
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16;
    if (nearBottom) onEndReached();
  };

  const hasSelection = Array.isArray(selectedItem)
    ? selectedItem.length > 0
    : !!selectedItem;

  return (
    <div className='flex flex-col gap-1'>
      {label && (
        <div className='flex items-center justify-between'>
          <span className='title-5 text-grey-800'>{label}</span>
          {labelRightContent}
        </div>
      )}

      <div className='relative'>
        <button
          ref={buttonRef}
          type='button'
          disabled={!!disabled}
          onClick={() => setOpen(v => !v)}
          className={cn(
            'w-full flex items-center justify-between rounded-[5px] border px-3',
            size === 'sm' ? 'h-[36px]' : 'h-[46px]',
            disabled ? 'bg-grey-100' : 'bg-white',
            hasError
              ? 'border-error'
              : 'border-grey-300 focus-visible:border-green-500',
          )}
        >
          <span
            className={cn(
              'body-5 truncate',
              disabled
                ? 'text-grey-400'
                : hasSelection
                  ? 'text-grey-800'
                  : 'text-grey-300',
            )}
          >
            {displayText}
          </span>
          <ChevronDownSvg
            className={
              disabled
                ? 'text-grey-400'
                : selectedItem
                  ? 'text-grey-800'
                  : 'text-grey-300'
            }
            width={20}
            height={20}
          />
        </button>

        {open && (
          <div
            ref={panelRef}
            role='listbox'
            className='absolute z-50 mt-1 w-full overflow-auto rounded-md border border-grey-200 bg-grey-0 shadow-sm'
            style={heightStyle}
            onScroll={onScroll}
          >
            {items.length === 0 ? (
              <div className='py-3 text-center body-4 text-grey-500'>
                {listEmptyText}
              </div>
            ) : (
              <ul className='py-1'>
                {items.map(item => {
                  const selected = isSelected(item);
                  return (
                    <li key={item}>
                      <button
                        type='button'
                        className={cn(
                          'w-[calc(100%-1rem)] flex items-center justify-between px-2 py-2 m-2 text-left rounded-sm',
                          selected
                            ? 'bg-green-300 text-grey-800'
                            : 'text-grey-500 hover:bg-grey-50',
                        )}
                        onClick={() => {
                          onSelect(item);
                          if (!multiple) setOpen(false);
                        }}
                      >
                        <span className='body-4'>{item}</span>
                        {selected && (
                          <CircleOkSvg
                            className='text-green-600'
                            width={20}
                            height={20}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {hasError && <p className='body-4 text-error'>{errorMessage}</p>}
      {bottomDescription && (
        <p className='body-4 text-confirm'>{bottomDescription}</p>
      )}
    </div>
  );
};
