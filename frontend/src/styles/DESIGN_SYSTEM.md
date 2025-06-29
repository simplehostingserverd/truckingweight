<!--

 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.


-->

# TruckingWeight Design System

This document provides an overview of the TruckingWeight design system, including colors, typography, spacing, and component guidelines.

## Table of Contents

1. [Brand Foundations](#brand-foundations)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Usage Guidelines](#usage-guidelines)

## Brand Foundations

### Brand Identity

- **Name**: TruckingWeight
- **Tagline**: "Precision Weighing for Modern Trucking"
- **Mission**: To simplify weight management for trucking operations through intelligent design and seamless technology
- **Values**: Efficiency, Accuracy, Compliance, Simplicity, Reliability

## Color Palette

### Primary Colors

- **Deep Blue** (#0D2B4B): Primary brand color, representing trust and reliability
- **Highway Yellow** (#FFC107): Action elements, alerts, and highlights
- **Steel Gray** (#607D8B): Secondary UI elements and backgrounds

### Secondary Colors

- **Forest Green** (#2E7D32): Success states and positive indicators
- **Brick Red** (#C62828): Error states and warnings
- **Slate** (#455A64): Neutral text and UI elements
- **Sky Blue** (#03A9F4): Interactive elements and links

### System Colors

- **Alert Red** (#D50000): Critical errors and warnings
- **Success Green** (#00C853): Compliance indicators and confirmations
- **Warning Orange** (#FF6D00): Caution indicators

## Typography

### Font Family

- **Primary**: Inter (sans-serif)
- **Brand**: Product Sans (for branded elements)

### Type Scale

- **Display**: 2.25rem (36px)
- **Heading 1**: 1.75rem (28px)
- **Heading 2**: 1.5rem (24px)
- **Heading 3**: 1.25rem (20px)
- **Body Large**: 1rem (16px)
- **Body**: 0.875rem (14px)
- **Caption**: 0.75rem (12px)
- **Small**: 0.625rem (10px)

### Font Weights

- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Bold**: 700

## Spacing

Our spacing system is based on a 4px grid. All spacing values are multiples of 4px.

- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **5**: 1.25rem (20px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **10**: 2.5rem (40px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)

## Components

### Buttons

Buttons are used for actions and navigation. We have several button variants:

- **Primary**: Used for primary actions
- **Secondary**: Used for secondary actions
- **Outline**: Used for less prominent actions
- **Ghost**: Used for the least prominent actions
- **Link**: Used for navigation

Button sizes:

- **Small**: For tight spaces
- **Medium**: Default size
- **Large**: For prominent actions

### Form Elements

#### Input

Text inputs for user data entry.

#### Select

Dropdown selects for choosing from a list of options.

#### Checkbox

For binary choices or multiple selections.

#### Radio

For selecting one option from a list.

### Cards

Cards are used to group related content and actions.

- **Card**: Container component
- **CardHeader**: For card titles and descriptions
- **CardContent**: For the main content
- **CardFooter**: For actions related to the card

### Badges

Badges are used to highlight status, categories, or counts.

- **Primary**: Default badge
- **Secondary**: Less prominent badge
- **Outline**: Subtle badge
- **Success**: For positive status
- **Warning**: For cautionary status
- **Alert**: For negative status

## Usage Guidelines

### Layout Principles

1. **Hierarchy**: Establish clear visual hierarchy to guide users through the interface
2. **Consistency**: Use consistent spacing, typography, and colors
3. **Simplicity**: Keep interfaces simple and focused on the task at hand
4. **Responsiveness**: Design for all screen sizes

### Accessibility Guidelines

1. **Color Contrast**: Ensure text has sufficient contrast against backgrounds
2. **Keyboard Navigation**: Make all interactive elements accessible via keyboard
3. **Screen Readers**: Provide appropriate ARIA labels and roles
4. **Focus States**: Make focus states visible and clear

### Implementation

The design system is implemented using Tailwind CSS with custom configuration. The core design tokens are defined in `design-tokens.js` and integrated into the Tailwind configuration.

Component classes are defined in `globals.css` and component-specific files in the `components/ui` directory.

For more detailed implementation guidelines, refer to the component documentation in the codebase.
