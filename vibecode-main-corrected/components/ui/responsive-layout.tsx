"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  enableMobilePadding?: boolean;
  enableSafeArea?: boolean;
}

export function ResponsiveLayout({
  children,
  className,
  mobileClassName,
  desktopClassName,
  enableMobilePadding = true,
  enableSafeArea = true,
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        'w-full h-full',
        // Base responsive classes
        'transition-all duration-300 ease-in-out',
        // Safe area support for mobile devices
        enableSafeArea && [
          'supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]',
          'supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]',
          'supports-[padding:env(safe-area-inset-left)]:pl-[env(safe-area-inset-left)]',
          'supports-[padding:env(safe-area-inset-right)]:pr-[env(safe-area-inset-right)]',
        ],
        // Mobile padding
        enableMobilePadding && 'px-4 sm:px-6 lg:px-8',
        // Conditional classes based on device type
        isMobile ? mobileClassName : desktopClassName,
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        // Grid columns
        `grid-cols-${cols.mobile}`,
        `sm:grid-cols-${cols.tablet}`,
        `lg:grid-cols-${cols.desktop}`,
        // Grid gaps
        `gap-${gap.mobile}`,
        `sm:gap-${gap.tablet}`,
        `lg:gap-${gap.desktop}`,
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centerContent?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  centerContent = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        centerContent && 'mx-auto',
        maxWidth !== 'full' && `max-w-${maxWidth}`,
        'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive Stack Component
interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    mobile?: 'row' | 'col';
    tablet?: 'row' | 'col';
    desktop?: 'row' | 'col';
  };
  spacing?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export function ResponsiveStack({
  children,
  className,
  direction = { mobile: 'col', tablet: 'row', desktop: 'row' },
  spacing = { mobile: 4, tablet: 6, desktop: 8 },
  align = 'start',
  justify = 'start',
}: ResponsiveStackProps) {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={cn(
        'flex w-full',
        // Direction
        `flex-${direction.mobile}`,
        `sm:flex-${direction.tablet}`,
        `lg:flex-${direction.desktop}`,
        // Spacing
        direction.mobile === 'col' ? `space-y-${spacing.mobile}` : `space-x-${spacing.mobile}`,
        direction.tablet === 'col' ? `sm:space-y-${spacing.tablet} sm:space-x-0` : `sm:space-x-${spacing.tablet} sm:space-y-0`,
        direction.desktop === 'col' ? `lg:space-y-${spacing.desktop} lg:space-x-0` : `lg:space-x-${spacing.desktop} lg:space-y-0`,
        // Alignment
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  };
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: {
    mobile?: 'left' | 'center' | 'right';
    tablet?: 'left' | 'center' | 'right';
    desktop?: 'left' | 'center' | 'right';
  };
}

export function ResponsiveText({
  children,
  className,
  size = { mobile: 'base', tablet: 'lg', desktop: 'xl' },
  weight = 'normal',
  align = { mobile: 'left', tablet: 'left', desktop: 'left' },
}: ResponsiveTextProps) {
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <div
      className={cn(
        // Text sizes
        `text-${size.mobile}`,
        `sm:text-${size.tablet}`,
        `lg:text-${size.desktop}`,
        // Text weight
        weightClasses[weight],
        // Text alignment
        `text-${align.mobile}`,
        `sm:text-${align.tablet}`,
        `lg:text-${align.desktop}`,
        className
      )}
    >
      {children}
    </div>
  );
}