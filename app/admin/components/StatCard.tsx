'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock, FileText, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';

const statCardIcons = {
  bookOpen: BookOpen,
  clock: Clock,
  fileText: FileText,
  hash: Hash,
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: keyof typeof statCardIcons;
  description?: string;
}

function parseValue(value: number | string): { numeric: number; suffix: string } {
  if (typeof value === 'number') {
    return { numeric: value, suffix: '' };
  }
  const match = value.match(/^([\d.]+)\s*(.*)$/);
  if (match) {
    return { numeric: parseFloat(match[1]), suffix: match[2] ? ` ${match[2]}` : '' };
  }
  return { numeric: 0, suffix: value };
}

export function StatCard({ label, value, icon, description }: StatCardProps) {
  const { numeric, suffix } = parseValue(value);
  const Icon = statCardIcons[icon];
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? numeric : 0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (numeric === 0 || prefersReducedMotion) {
      setDisplayValue(numeric);
      return;
    }

    const duration = 1000;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * numeric);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [numeric, prefersReducedMotion]);

  const formattedDisplay =
    numeric === 0 && suffix
      ? suffix
      : `${Number.isInteger(numeric) ? Math.round(displayValue) : displayValue.toFixed(1)}${suffix}`;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{formattedDisplay}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
