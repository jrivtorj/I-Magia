export default function Spinner({ label, fullscreen = false }) {
  const inner = (
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
      {label && <p className="font-body text-muted-foreground text-sm">{label}</p>}
    </div>
  );
  return fullscreen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-background">{inner}</div>
  ) : (
    <div className="flex items-center justify-center py-24">{inner}</div>
  );
}
