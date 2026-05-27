import { LayoutWrapper } from "@/components";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
