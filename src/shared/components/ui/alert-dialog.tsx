/**
 * AlertDialog — built on top of the existing Dialog primitive.
 * Provides the same API as the standard shadcn/ui AlertDialog without
 * requiring an additional @radix-ui/react-alert-dialog dependency.
 */

import type React from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const AlertDialog = Dialog;
const AlertDialogTrigger = DialogTrigger;

function AlertDialogContent({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof DialogContent>) {
  return (
    <DialogContent
      ref={ref}
      className={cn("sm:max-w-lg", className)}
      {...props}
    />
  );
}
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = DialogHeader;
const AlertDialogFooter = DialogFooter;

function AlertDialogTitle({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof DialogTitle>) {
  return (
    <DialogTitle
      ref={ref}
      className={cn("font-bold text-base", className)}
      {...props}
    />
  );
}
AlertDialogTitle.displayName = "AlertDialogTitle";

function AlertDialogDescription({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof DialogDescription>) {
  return (
    <DialogDescription
      ref={ref}
      className={cn("text-sm", className)}
      {...props}
    />
  );
}
AlertDialogDescription.displayName = "AlertDialogDescription";

type AlertDialogCancelProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
};

function AlertDialogCancel({
  className,
  ref,
  ...props
}: AlertDialogCancelProps) {
  return (
    <DialogClose asChild>
      <Button ref={ref} variant="outline" className={className} {...props} />
    </DialogClose>
  );
}
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
};
