// Export all UI components from this file for easier imports

// Button
export { default as Button } from './button';
export type { ButtonProps } from './button';

// Input - support both casing versions
export { default as Input } from './input';
export type { InputProps } from './input';

// Select - support both casing versions
export { default as Select } from './select';
export type { SelectProps, SelectOption } from './select';
export { SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';

// Badge - support both casing versions
export { default as Badge } from './badge';
export type { BadgeProps } from './badge';

// Card - support both casing versions
export { default as Card } from './card';
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

// Tabs - support both casing versions
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

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

// Re-export existing components
export { default as MobileNav } from './MobileNav';
export { default as ServiceWorkerRegistration } from './ServiceWorkerRegistration';

// We're now using lowercase versions directly, so no need for these re-exports
