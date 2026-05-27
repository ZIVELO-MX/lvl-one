import { AppProvider } from "@/lib/store";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
