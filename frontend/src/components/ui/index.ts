// Export all UI components from this file for easier imports

// Button
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

// Input
export { Input } from './input';
export type { InputProps } from './input';

// Select
export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

// Badge
export { Badge } from './badge';
export type { BadgeProps } from './badge';

// Card
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

// Tabs
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
export { Switch } from './switch';

// Re-export existing components
export { default as MobileNav } from './MobileNav';
export { default as ServiceWorkerRegistration } from './ServiceWorkerRegistration';

// Export dropdown menu components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';
