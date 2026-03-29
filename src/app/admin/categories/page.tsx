import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "@/lib/actions";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-50">Categories</h1>
      <p className="mt-1 text-sm text-ink-400">
        Organize posts; writers pick a category when submitting.
      </p>

      <form
        action={createCategory as unknown as (fd: FormData) => void | Promise<void>}
        className="mt-10 max-w-xl space-y-4 rounded-xl border border-ink-800 bg-ink-900/30 p-5"
      >
        <p className="text-sm font-medium text-ink-200">New category</p>
        <div>
          <label htmlFor="name" className="text-sm text-ink-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-ink-100"
          />
        </div>
        <div>
          <label htmlFor="slug" className="text-sm text-ink-300">
            Slug (optional)
          </label>
          <input
            id="slug"
            name="slug"
            className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-ink-100"
          />
        </div>
        <div>
          <label htmlFor="description" className="text-sm text-ink-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-ink-100"
          />
        </div>
        <div>
          <label htmlFor="sortOrder" className="text-sm text-ink-300">
            Sort order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={0}
            className="mt-1 w-32 rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-ink-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-ember-500 px-6 py-2 text-sm font-semibold text-white hover:bg-ember-600"
        >
          Add category
        </button>
      </form>

      <ul className="mt-12 divide-y divide-ink-800 border-t border-ink-800">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-ink-100">{c.name}</p>
              <p className="text-xs text-ink-500">
                /blog?category={c.slug} · order {c.sortOrder}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/categories/${c.id}/edit`}
                className="rounded-md border border-ink-700 px-3 py-1 text-xs text-ink-300 hover:border-ember-500/50"
              >
                Edit
              </Link>
              <form
                action={
                  deleteCategory.bind(null, c.id) as unknown as (
                    fd: FormData,
                  ) => void | Promise<void>
                }
              >
                <button
                  type="submit"
                  className="rounded-md border border-red-900/60 px-3 py-1 text-xs text-red-300 hover:bg-red-950/30"
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {categories.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500">No categories yet.</p>
      ) : null}
    </div>
  );
}
