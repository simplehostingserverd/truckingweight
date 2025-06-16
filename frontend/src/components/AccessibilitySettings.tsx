/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  EyeIcon,
  MinusIcon,
  PlusIcon,
  ArrowPathIcon,
  CursorArrowRaysIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';

/**
 * Accessibility settings dialog component
 */
export function AccessibilitySettings() {
  const [open, setOpen] = useState(false);
  const {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    fontSizeMultiplier,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    alwaysShowFocus,
    toggleAlwaysShowFocus,
  } = useAccessibility();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Accessibility Settings"
          className="relative"
        >
          <EyeIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
          <DialogDescription>
            Customize your experience to make the application more accessible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better readability
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={toggleHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">Minimizes animations and transitions</p>
            </div>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={toggleReducedMotion}
              aria-label="Toggle reduced motion"
            />
          </div>

          {/* Always Show Focus */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="always-show-focus">Always Show Focus</Label>
              <p className="text-sm text-muted-foreground">
                Always display focus indicators for keyboard navigation
              </p>
            </div>
            <Switch
              id="always-show-focus"
              checked={alwaysShowFocus}
              onCheckedChange={toggleAlwaysShowFocus}
              aria-label="Toggle always show focus"
            />
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size ({Math.round(fontSizeMultiplier * 100)}%)</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseFontSize}
                aria-label="Decrease font size"
                disabled={fontSizeMultiplier <= 0.8}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Slider
                id="font-size"
                value={[fontSizeMultiplier * 100]}
                min={80}
                max={150}
                step={10}
                onValueChange={value => {
                  const newValue = value[0] / 100;
                  if (newValue < fontSizeMultiplier) {
                    decreaseFontSize();
                  } else if (newValue > fontSizeMultiplier) {
                    increaseFontSize();
                  }
                }}
                aria-label="Adjust font size"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={increaseFontSize}
                aria-label="Increase font size"
                disabled={fontSizeMultiplier >= 1.5}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={resetFontSize}
                aria-label="Reset font size"
                disabled={fontSizeMultiplier === 1}
              >
                <ArrowPathIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Accessibility button component for the header
 */
export function AccessibilityButton() {
  return <AccessibilitySettings />;
}
