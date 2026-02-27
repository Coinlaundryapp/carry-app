'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '@shared/lib/utils';
import { IndicatorIcon } from '@assets/icons';

const Drawer = ({
  shouldScaleBackground = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerClose = DrawerPrimitive.Close;

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  showIndicator?: boolean;
  shouldShowOverlay?: boolean;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, showIndicator = false, shouldShowOverlay = true, ...props }, ref) => (
  <DrawerPrimitive.Portal>
    {shouldShowOverlay && (
      <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70" />
    )}
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mx-auto mt-24 flex h-auto max-w-[480px] flex-col rounded-xl bg-white focus:outline-none',
        className,
      )}
      {...props}
    >
      {showIndicator && (
        <div className="mx-auto py-1">
          <IndicatorIcon />
        </div>
      )}
      {children}
    </DrawerPrimitive.Content>
  </DrawerPrimitive.Portal>
));
DrawerContent.displayName = 'DrawerContent';

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent };
