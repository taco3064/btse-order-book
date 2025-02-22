import cx from 'clsx';
import type { ArrowIconProps } from './types';

export default function ArrowIcon({ className, direction }: ArrowIconProps) {
  return (
    <svg
      role="icon"
      xmlns="http://www.w3.org/2000/svg"
      className={cx(`rotate-${direction === 'down' ? 0 : 180}`, className)}
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}
