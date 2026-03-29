import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCategory } from "@/lib/actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) notFound();

  const save = updateCategory.bind(null, cat.id);

  return (
    <div>
      <Link
        href="/admin/categories"
        className="text-sm text-ink-400 hover:text-ember-500"
      >
        ← Categories
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink-50">Edit category</h1>
      <form
        action={save as unknown as (fd: FormData) => void | Promise<void>}
        className="mt-8 max-w-xl space-y-4"
      >
        <div>
          <label htmlFor="name" className="text-sm text-ink-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={cat.name}
            className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-ink-100"
          />
        </div>
        <div>
          <label htmlFor="slug" className="text-sm text-ink-300">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={cat.slug}
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
            rows={3}
            defaultValue={cat.description ?? ""}
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
            defaultValue={cat.sortOrder}
            className="mt-1 w-32 rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-ink-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-ember-500 px-8 py-2 text-sm font-semibold text-white hover:bg-ember-600"
        >
          Save
        </button>
      </form>
    </div>
  );
}
