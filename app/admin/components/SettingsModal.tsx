'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'admin_settings_v1';

export type AdminTheme = 'system' | 'light' | 'dark';
export type AdminDensity = 'comfortable' | 'compact';

export interface AdminSettings {
  analytics: {
    defaultWindowDays: number;
    autoRefreshIntervalMinutes: number;
  };
  notifications: {
    emailAlerts: boolean;
  };
  display: {
    theme: AdminTheme;
    density: AdminDensity;
  };
}

const DEFAULT_SETTINGS: AdminSettings = {
  analytics: {
    defaultWindowDays: 30,
    autoRefreshIntervalMinutes: 5,
  },
  notifications: {
    emailAlerts: false,
  },
  display: {
    theme: 'system',
    density: 'comfortable',
  },
};

function loadSettings(): AdminSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    return {
      analytics: { ...DEFAULT_SETTINGS.analytics, ...parsed.analytics },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
      display: { ...DEFAULT_SETTINGS.display, ...parsed.display },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AdminSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

interface SettingsModalProps {
  className?: string;
  onSettingsChange?: (settings: AdminSettings) => void;
}

export function SettingsModal({ className, onSettingsChange }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration
    setSettings(loadSettings());
    setIsHydrated(true);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<AdminSettings>) => {
      const next = {
        ...settings,
        ...patch,
        analytics: { ...settings.analytics, ...patch.analytics },
        notifications: { ...settings.notifications, ...patch.notifications },
        display: { ...settings.display, ...patch.display },
      };
      setSettings(next);
      saveSettings(next);
      onSettingsChange?.(next);
    },
    [settings, onSettingsChange]
  );

  if (!isHydrated) {
    return (
      <Button variant="outline" size="sm" className={cn('gap-2', className)} disabled>
        <Settings className="size-4" />
        Settings
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <Settings className="size-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Admin Settings</DialogTitle>
          <DialogDescription>
            Customize your dashboard experience. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="analytics" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4 py-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="window-days">Default Window</Label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {settings.analytics.defaultWindowDays} days
                  </span>
                </div>
                <Slider
                  id="window-days"
                  min={7}
                  max={90}
                  step={1}
                  value={[settings.analytics.defaultWindowDays]}
                  onValueChange={([value]) =>
                    updateSettings({ analytics: { ...settings.analytics, defaultWindowDays: value } })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Default number of days for analytics charts and tables.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="refresh-interval">Auto-refresh</Label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {settings.analytics.autoRefreshIntervalMinutes} min
                  </span>
                </div>
                <Slider
                  id="refresh-interval"
                  min={1}
                  max={60}
                  step={1}
                  value={[settings.analytics.autoRefreshIntervalMinutes]}
                  onValueChange={([value]) =>
                    updateSettings({ analytics: { ...settings.analytics, autoRefreshIntervalMinutes: value } })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  How often dashboard data refreshes automatically.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="email-alerts">Email Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for critical dashboard events.
                </p>
              </div>
              <Switch
                id="email-alerts"
                checked={settings.notifications.emailAlerts}
                onCheckedChange={(checked) =>
                  updateSettings({ notifications: { ...settings.notifications, emailAlerts: checked } })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 py-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['system', 'light', 'dark'] as AdminTheme[]).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => updateSettings({ display: { ...settings.display, theme } })}
                      className={cn(
                        'rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors',
                        settings.display.theme === theme
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Density</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['comfortable', 'compact'] as AdminDensity[]).map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => updateSettings({ display: { ...settings.display, density } })}
                      className={cn(
                        'rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors',
                        settings.display.density === density
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {density}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Adjust spacing and padding across dashboard tables and cards.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
