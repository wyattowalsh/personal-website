// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TelemetryAutoRefresh } from './TelemetryAutoRefresh';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

describe('TelemetryAutoRefresh', () => {
  beforeEach(() => {
    mockRefresh.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default interval', () => {
    render(<TelemetryAutoRefresh />);
    expect(screen.getByText('Auto refresh every 30s')).toBeInTheDocument();
  });

  it('renders with custom interval', () => {
    render(<TelemetryAutoRefresh intervalMs={60000} />);
    expect(screen.getByText('Auto refresh every 60s')).toBeInTheDocument();
  });

  it('triggers refresh on button click', () => {
    render(<TelemetryAutoRefresh intervalMs={0} />);
    const button = screen.getByLabelText('Refresh telemetry');
    fireEvent.click(button);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not auto-refresh when interval is 0', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    render(<TelemetryAutoRefresh intervalMs={0} />);
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });
});
