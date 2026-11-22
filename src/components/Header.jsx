import { useState } from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, LogOut, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { deleteAccount } from "@/lib/api";
import { LANGUAGES, getStoryLanguage, setStoryLanguage } from "@/lib/utils";

export default function Header() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [lang, setLang] = useState(getStoryLanguage);

  const changeLang = (value) => {
    setLang(value);
    setStoryLanguage(value);
  };

  const onDelete = async () => {
    if (!confirming) return setConfirming(true);
    setDeleting(true);
    try {
      await deleteAccount();
      await signOut();
      setOpen(false);
    } catch (e) {
      alert(`No se pudo eliminar la cuenta: ${e.message}`);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden">
              <img src="/logo-small.png" alt="I-magIA" className="w-full h-full object-cover" />
            </div>
            <span className="font-heading font-bold text-base text-foreground">I-magIA</span>
          </Link>
          {user && (
            <button
              onClick={() => setOpen(true)}
              aria-label="Ajustes"
              className="select-none w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <Dialog.Root
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          setConfirming(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg rounded-2xl">
            <div className="flex flex-col space-y-1.5">
              <Dialog.Title className="text-lg font-semibold font-heading">Ajustes</Dialog.Title>
              <Dialog.Description className="text-muted-foreground font-body text-sm">
                Gestiona tu cuenta y preferencias.
              </Dialog.Description>
            </div>

            <div className="py-2 space-y-4">
              <div className="space-y-1.5">
                <label className="font-body text-sm font-semibold text-foreground">
                  Idioma de los cuentos
                </label>
                <Select.Root value={lang} onValueChange={changeLang}>
                  <Select.Trigger className="flex h-9 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm font-body focus:outline-none focus:ring-1 focus:ring-ring">
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={4}
                      className="z-50 max-h-96 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md"
                    >
                      <Select.Viewport className="p-1">
                        {LANGUAGES.map((l) => (
                          <Select.Item
                            key={l.value}
                            value={l.value}
                            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none font-body focus:bg-muted"
                          >
                            <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                              <Select.ItemIndicator>
                                <Check className="h-4 w-4" />
                              </Select.ItemIndicator>
                            </span>
                            <Select.ItemText>{l.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              <hr className="border-border" />

              <Button variant="outline" className="w-full rounded-xl font-body gap-2" onClick={signOut}>
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </Button>

              <Button
                variant="destructive"
                className="w-full rounded-xl font-body gap-2"
                onClick={onDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" />
                {deleting
                  ? "Eliminando cuenta..."
                  : confirming
                    ? "Pulsa otra vez para confirmar"
                    : "Eliminar mi cuenta"}
              </Button>
              <p className="text-xs text-muted-foreground font-body mt-2 text-center">
                Esta acción borrará todos tus cuentos y tu cuenta de forma permanente.
              </p>
            </div>

            <div className="flex justify-end">
              <Dialog.Close asChild>
                <Button variant="ghost" className="rounded-xl font-body">
                  Cancelar
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
