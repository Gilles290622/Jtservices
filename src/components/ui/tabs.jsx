import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import React from 'react';
import { motion } from 'framer-motion';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-auto items-center justify-center border-b border-border p-0',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative inline-flex items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-semibold text-muted-foreground ring-offset-background transition-colors hover:text-primary focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary',
      className
    )}
    {...props}
  >
    {children}
    {props['data-state'] === 'active' && (
      <motion.div
        className="absolute bottom-[-1px] left-0 right-0 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
        layoutId="underline"
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    )}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };