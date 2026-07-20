import { describe, expect, it } from 'vitest';

import { validateNightOutAnswers } from './planAnswers';

describe('planAnswers', () => {
  it('validates night out answers', () => {
    expect(
      validateNightOutAnswers({
        city: 'Austin',
        interests: 'jazz and tacos',
        group_size: 4,
        budget_per_person: 65,
        dates: 'Saturday',
        start_time: '8:00 PM',
      }),
    ).toBe(true);
  });
});
