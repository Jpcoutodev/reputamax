"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteButtonProps {
  /** server action já vinculada ao id (ex.: action.bind(null, id)) */
  action: () => Promise<{ ok: boolean; error?: string }>;
  title: string;
  description: string;
  successMessage: string;
}

/** Botão de excluir com confirmação (uso no admin). */
export function DeleteButton({ action, title, description, successMessage }: DeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ? `Não foi possível excluir: ${result.error}` : "Não foi possível excluir.");
        return;
      }
      toast.success(successMessage);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-danger"
        aria-label="Excluir"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              className="bg-danger text-white hover:bg-danger/90"
              onClick={handleConfirm}
              disabled={pending}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
