import { Toaster as SonnerToaster } from 'sonner';

export function Toaster(props: Parameters<typeof SonnerToaster>[0]) {
  return <SonnerToaster {...props} />;
}