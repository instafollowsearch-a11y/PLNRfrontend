import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { accountApi } from '../../lib/api';
import { VisitTracker } from './VisitTracker';

vi.mock('../../lib/api', () => ({
  accountApi: {
    recordVisit: vi.fn().mockResolvedValue({ data: null, message: 'Visit recorded.' }),
  },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <VisitTracker />
    </MemoryRouter>,
  );
}

describe('VisitTracker', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(accountApi.recordVisit).mockReset();
    vi.mocked(accountApi.recordVisit).mockResolvedValue({
      data: null,
      message: 'ok',
    });
  });

  it('records a public page', () => {
    renderAt('/login');

    expect(accountApi.recordVisit).toHaveBeenCalledTimes(1);
    expect(accountApi.recordVisit).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/login' }),
    );
  });

  it('does not record admin pages', () => {
    renderAt('/admin/users');

    expect(accountApi.recordVisit).not.toHaveBeenCalled();
  });

  it('swallows a failed post', async () => {
    vi.mocked(accountApi.recordVisit).mockRejectedValue(new Error('offline'));

    renderAt('/');

    await vi.waitFor(() => {
      expect(accountApi.recordVisit).toHaveBeenCalledTimes(1);
    });
  });
});
