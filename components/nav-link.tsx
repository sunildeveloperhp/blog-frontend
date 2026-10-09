"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
};

// A menu link that turns blue on the current page (like the Blade nav-link component)
export default function NavLink({ href, children }: Props) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link href={href} className={active ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}>
      {children}
    </Link>
  );
}