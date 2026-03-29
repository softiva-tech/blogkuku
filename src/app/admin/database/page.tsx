import { prisma } from "@/lib/prisma";

export default async function AdminDatabasePage() {
  const [
    users,
    posts,
    comments,
    categories,
    impersonationTokens,
    siteSettingsRows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.category.count(),
    prisma.impersonationToken.count(),
    prisma.siteSettings.count(),
  ]);

  const rows = [
    { label: "Users", count: users },
    { label: "Posts", count: posts },
    { label: "Comments", count: comments },
    { label: "Categories", count: categories },
    { label: "Impersonation tokens (pending)", count: impersonationTokens },
    { label: "Site settings rows", count: siteSettingsRows },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-50">Database overview</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-400">
        Read-only counts for your PostgreSQL database (InsForge). Inspect or edit
        rows locally with{" "}
        <code className="rounded bg-ink-900 px-1 text-ink-200">npx prisma studio</code>
        .
      </p>
      <ul className="mt-10 divide-y divide-ink-800 rounded-xl border border-ink-800">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between px-5 py-4 text-sm"
          >
            <span className="text-ink-300">{r.label}</span>
            <span className="font-display text-xl text-ink-50">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
