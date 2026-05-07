// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ChartInteraction } from './ChartInteraction';

describe('ChartInteraction', () => {
  it('renders structured chart data alternatives for assistive technologies', () => {
    render(
      <ChartInteraction
        title="Traffic Trends"
        summary="Daily traffic chart for 30 days."
        dataDescription={{
          caption: 'Daily traffic values',
          rows: [
            { label: '2026-05-01', value: '42 pageviews', detail: '12 visitors, 9 sessions' },
          ],
        }}
      >
        <div>visual chart</div>
      </ChartInteraction>
    );

    const group = screen.getByRole('figure', { name: 'Traffic Trends' });
    expect(group).toHaveAccessibleDescription(/Daily traffic chart for 30 days/);
    const table = screen.getByRole('table', { name: 'Daily traffic values' });
    expect(table).toHaveClass('sr-only');
    expect(within(table).getByRole('row', { name: /2026-05-01 42 pageviews 12 visitors, 9 sessions/ })).toBeInTheDocument();
  });
});
