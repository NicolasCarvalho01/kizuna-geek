"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-[color:var(--color-navy-deep)]/60 backdrop-blur-sm",
      "data-[state=open]:animate-[fade-in_var(--motion-base)_var(--ease-out-3)_forwards]",
      "data-[state=closed]:opacity-0 transition-opacity",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

type Side = "top" | "right" | "bottom" | "left";

const sideClasses: Record<Side, string> = {
  top: "inset-x-0 top-0 border-b w-full max-h-[85vh] data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
  bottom: "inset-x-0 bottom-0 border-t w-full max-h-[85vh] data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
  left: "inset-y-0 left-0 h-full w-full sm:max-w-md border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
  right: "inset-y-0 right-0 h-full w-full sm:max-w-md border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
};

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: Side;
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50",
        "bg-[color:var(--color-bg)] text-[color:var(--color-fg)]",
        "border-[color:var(--color-border)]",
        "shadow-[var(--shadow-4)]",
        "transition-transform duration-[var(--motion-slow)] ease-[var(--ease-io-4)]",
        sideClasses[side],
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Fechar"
        className={cn(
          "absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center",
          "rounded-[var(--radius-pill)] text-[color:var(--color-fg-soft)]",
          "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
          "hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-fg)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]",
        )}
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-7 pt-9 pb-6 border-b border-[color:var(--color-border)]",
        className,
      )}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-7 py-6 border-t border-[color:var(--color-border)] mt-auto",
        className,
      )}
      {...props}
    />
  );
}

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-[var(--font-display)] text-[var(--text-h4)] font-light",
      "tracking-[var(--tracking-tight)] leading-[var(--leading-snug)]",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";
