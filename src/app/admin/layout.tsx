import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings & pay" },
  { href: "/admin/database", label: "Database" },
  { href: "/blog", label: "View site" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6">
      <aside className="w-full shrink-0 sm:w-52">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          Admin
        </p>
        <nav className="mt-4 flex flex-col gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2 py-2 text-ink-300 hover:bg-ink-900 hover:text-ink-50"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
