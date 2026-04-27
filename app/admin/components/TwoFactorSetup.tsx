'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState(1);
  const [secret] = useState('JBSWY3DPEHPK3PXP');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleVerify() {
    setError(null);
    // Demo verification: any 6-digit code starting with '1'
    if (/^1\d{5}$/.test(token.trim())) {
      setBackupCodes(
        Array.from({ length: 10 }, () =>
          Math.random().toString(36).slice(2, 10).toUpperCase()
        )
      );
      setStep(3);
    } else {
      setError(
        'Invalid code. For this demo, enter any 6-digit code starting with 1.'
      );
    }
  }

  function copyCodes() {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                s === step
                  ? 'bg-primary text-primary-foreground'
                  : s < step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {s < step ? '✓' : s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan the QR code below with your authenticator app.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg border border-border bg-white p-4">
                {/* Mock QR code SVG */}
                <svg
                  width="160"
                  height="160"
                  viewBox="0 0 160 160"
                  className="text-foreground"
                >
                  <rect width="160" height="160" fill="white" />
                  <rect x="10" y="10" width="50" height="50" fill="currentColor" />
                  <rect x="20" y="20" width="30" height="30" fill="white" />
                  <rect x="25" y="25" width="20" height="20" fill="currentColor" />
                  <rect x="100" y="10" width="50" height="50" fill="currentColor" />
                  <rect x="110" y="20" width="30" height="30" fill="white" />
                  <rect x="115" y="25" width="20" height="20" fill="currentColor" />
                  <rect x="10" y="100" width="50" height="50" fill="currentColor" />
                  <rect x="20" y="110" width="30" height="30" fill="white" />
                  <rect x="25" y="115" width="20" height="20" fill="currentColor" />
                  <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                  <rect x="70" y="40" width="20" height="20" fill="currentColor" />
                  <rect x="70" y="70" width="20" height="20" fill="currentColor" />
                  <rect x="100" y="70" width="20" height="20" fill="currentColor" />
                  <rect x="130" y="70" width="20" height="20" fill="currentColor" />
                  <rect x="100" y="100" width="50" height="50" fill="currentColor" />
                  <rect x="70" y="100" width="20" height="20" fill="currentColor" />
                  <rect x="70" y="130" width="20" height="20" fill="currentColor" />
                </svg>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-mono">
                <span>{secret}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => navigator.clipboard.writeText(secret)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to verify.
            </p>
            <Input
              placeholder="000000"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              className="text-center text-lg tracking-[0.5em]"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handleVerify} className="flex-1">
                Verify
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Save these backup codes in a secure location. They can be used to
              recover access if you lose your device.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-4">
              {backupCodes.map((code, i) => (
                <div key={i} className="text-center font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyCodes}
                className="flex-1 gap-1.5"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy Codes'}
              </Button>
              <Button onClick={() => onComplete?.()} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
