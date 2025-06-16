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

// Export all UI components from this file for easier imports

// Button
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

// Input
export { Input } from './input';
export type { InputProps } from './input';

// Label
export { Label } from './label';

// Select
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

// Badge
export { Badge } from './badge';
export type { BadgeProps } from './badge';

// Card
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

// Tabs
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

// Dialog components
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

// Table components
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// Alert components
export { Alert, AlertDescription, AlertTitle } from './alert';

// Other components
export { Separator } from './separator';
export { Skeleton } from './skeleton';
export { Slider } from './slider';
export { Switch } from './switch';

// Re-export existing components
export { default as MobileNav } from './MobileNav';
export { default as ServiceWorkerRegistration } from './ServiceWorkerRegistration';

// Export dropdown menu components
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';
