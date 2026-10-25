import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ScrollToTop } from './ScrollToTop';

describe('ScrollToTop', () => {
  it('scrolls the window to the top on the initial route', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    const router = createMemoryRouter(
      [
        {
          path: '/terms',
          element: (
            <>
              <ScrollToTop />
              <div>Terms</div>
            </>
          ),
        },
      ],
      { initialEntries: ['/terms'] },
    );

    render(<RouterProvider router={router} />);

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockRestore();
  });

  it('scrolls to a hash target when present', () => {
    const scrollIntoView = vi.fn();
    const target = document.createElement('div');
    target.id = 'how-it-works';
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <>
              <ScrollToTop />
              <div>Home</div>
            </>
          ),
        },
      ],
      { initialEntries: ['/#how-it-works'] },
    );

    render(<RouterProvider router={router} />);

    expect(scrollIntoView).toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();

    raf.mockRestore();
    scrollTo.mockRestore();
    target.remove();
  });
});
