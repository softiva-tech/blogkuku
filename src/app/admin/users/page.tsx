import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  adminSetUserPassword,
  deleteUser,
  impersonateUserAction,
  setUserBlocked,
  setUserWriterApproved,
  updateUserRoleAction,
} from "@/lib/actions";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      blocked: true,
      writerApproved: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-50">Users</h1>
      <p className="mt-1 text-sm text-ink-400">
        Approve writers (so they can use Submit), block accounts, reset passwords,
        impersonate (10-minute token), or change roles.
      </p>
      <div className="mt-10 space-y-12">
        {users.map((u) => {
          const isSelf = u.id === session?.user?.id;
          return (
            <div
              key={u.id}
              className="rounded-xl border border-ink-800 bg-ink-900/30 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink-100">
                    {u.name || u.email}
                    {u.blocked ? (
                      <span className="ml-2 text-xs font-normal text-red-400">
                        (blocked)
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Joined {u.createdAt.toLocaleDateString()}
                  </p>
                  {u.role === "USER" ? (
                    <p className="mt-1 text-xs text-ink-500">
                      Story submissions:{" "}
                      {u.writerApproved ? (
                        <span className="text-emerald-400">approved</span>
                      ) : (
                        <span className="text-amber-400">pending admin</span>
                      )}
                    </p>
                  ) : null}
                </div>
                {!isSelf ? (
                  <div className="flex flex-wrap gap-2">
                    {u.role === "USER" ? (
                      <form
                        action={
                          setUserWriterApproved.bind(
                            null,
                            u.id,
                            !u.writerApproved,
                          ) as unknown as (fd: FormData) => void | Promise<void>
                        }
                      >
                        <button
                          type="submit"
                          className="rounded-md border border-emerald-900/50 bg-emerald-950/20 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-950/40"
                        >
                          {u.writerApproved
                            ? "Revoke submit access"
                            : "Approve submit access"}
                        </button>
                      </form>
                    ) : null}
                    <form
                      action={
                        setUserBlocked.bind(
                          null,
                          u.id,
                          !u.blocked,
                        ) as unknown as (fd: FormData) => void | Promise<void>
                      }
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-ink-700 px-3 py-1 text-xs text-ink-200 hover:border-ember-500/40"
                      >
                        {u.blocked ? "Unblock" : "Block"}
                      </button>
                    </form>
                    <form
                      action={
                        impersonateUserAction as unknown as (
                          fd: FormData,
                        ) => void | Promise<void>
                      }
                    >
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-amber-800/60 bg-amber-950/30 px-3 py-1 text-xs text-amber-200 hover:bg-amber-950/50"
                      >
                        Sign in as…
                      </button>
                    </form>
                    <form
                      action={
                        deleteUser.bind(null, u.id) as unknown as (
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
                ) : (
                  <p className="text-xs text-ink-600">This is you</p>
                )}
              </div>

              <div className="mt-5 grid gap-6 border-t border-ink-800/80 pt-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
                    Role
                  </p>
                  {isSelf ? (
                    <p className="mt-2 text-sm text-ink-500">{u.role}</p>
                  ) : (
                    <form
                      action={
                        updateUserRoleAction as unknown as (
                          fd: FormData,
                        ) => void | Promise<void>
                      }
                      className="mt-2 flex gap-2"
                    >
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-md border border-ink-700 bg-ink-950 px-2 py-1 text-sm text-ink-100"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-md bg-ink-800 px-2 py-1 text-xs text-ink-200 hover:bg-ink-700"
                      >
                        Update
                      </button>
                    </form>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
                    Set password (admin)
                  </p>
                  <form
                    action={
                      adminSetUserPassword as unknown as (
                        fd: FormData,
                      ) => void | Promise<void>
                    }
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    <input type="hidden" name="userId" value={u.id} />
                    <input
                      type="password"
                      name="newPassword"
                      minLength={8}
                      placeholder="New password"
                      autoComplete="new-password"
                      className="min-w-[12rem] flex-1 rounded-md border border-ink-700 bg-ink-950 px-2 py-1 text-sm text-ink-100"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-ink-800 px-3 py-1 text-xs text-ink-200 hover:bg-ink-700"
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
