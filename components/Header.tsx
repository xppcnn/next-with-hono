import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";

export function Header() {
  return (
    <header className="border-b border-border">
      <nav className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        <Link href="/" className="font-bold text-lg">
          Logo
        </Link>
        <UserMenu />
      </nav>
    </header>
  );
}
