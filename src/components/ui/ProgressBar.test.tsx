import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders fill for current step', () => {
    const { container } = render(<ProgressBar step={1} total={4} />);
    const fill = container.querySelector('.progress-bar__fill') as HTMLElement;

    expect(fill.style.width).toBe('50%');
  });

  it('renders progress bar container', () => {
    const { container } = render(<ProgressBar step={0} total={3} />);

    expect(container.querySelector('.progress-bar')).toBeTruthy();
  });
});
