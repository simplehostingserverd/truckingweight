// Export all UI components from this file for easier imports

// Button
export { default as Button } from './Button';
export type { ButtonProps } from './Button';

// Input - support both casing versions
export { default as Input } from './Input';
export type { InputProps } from './Input';

// Select - support both casing versions
export { default as Select } from './Select';
export type { SelectProps, SelectOption } from './Select';
export { SelectTrigger, SelectValue, SelectContent, SelectItem } from './Select';

// Badge - support both casing versions
export { default as Badge } from './Badge';
export type { BadgeProps } from './Badge';

// Card - support both casing versions
export { default as Card } from './Card';
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

// Tabs - support both casing versions
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

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

// Ensure lowercase versions are also exported
import * as buttonLower from './button';
import * as inputLower from './input';
import * as badgeLower from './badge';
import * as selectLower from './select';
import * as tabsLower from './tabs';
import * as cardLower from './card';

// Re-export lowercase versions
export { buttonLower, inputLower, badgeLower, selectLower, tabsLower, cardLower };
