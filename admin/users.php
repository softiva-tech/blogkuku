<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_admin();

$page_title = 'Users';
include __DIR__ . '/includes/layout-start.php';

$q = $conn->query('SELECT id, username, email, role, status, daily_post_limit, verified_at, created_at FROM users ORDER BY id ASC');
$me = (int) current_user()['id'];
?>

<div class="admin-top">
    <h1>Users</h1>
    <a href="user-form.php" class="btn btn-primary"><i class="fa-solid fa-user-plus"></i> Add user</a>
</div>

<div class="admin-table-wrap">
    <table class="admin-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Daily limit</th>
                <th>Posting</th>
                <th>Created</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <?php if ($q && $q->num_rows): ?>
                <?php while ($r = $q->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo (int) $r['id']; ?></td>
                        <td><?php echo e($r['username']); ?><?php echo (int) $r['id'] === $me ? ' (you)' : ''; ?></td>
                        <td><?php echo e($r['email']); ?></td>
                        <td><?php echo e($r['role']); ?></td>
                        <td><?php echo e($r['status'] ?? 'active'); ?></td>
                        <td><?php
                            $dl = (int) ($r['daily_post_limit'] ?? 10);
                        echo $dl === -1 ? '∞' : (string) $dl;
                        ?></td>
                        <td><?php
                            $rr = $r['role'] ?? '';
                        if ($rr === 'admin' || $rr === 'editor') {
                            echo '<span style="color:#16a34a;">—</span>';
                        } elseif ($rr === 'member') {
                            echo !empty($r['verified_at'])
                                ? '<span style="color:#16a34a;">Approved</span>'
                                : '<span style="color:#ca8a04;">Pending</span>';
                        } else {
                            echo '—';
                        }
                        ?></td>
                        <td><?php echo e($r['created_at']); ?></td>
                        <td style="white-space:nowrap;">
                            <a href="user-form.php?id=<?php echo (int) $r['id']; ?>">Edit</a>
                            <?php if ((int) $r['id'] !== $me): ?>
                                ·
                                <form method="post" action="user-toggle-block.php" style="display:inline;">
                                    <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                                    <input type="hidden" name="id" value="<?php echo (int) $r['id']; ?>">
                                    <?php if (($r['status'] ?? '') === 'blocked'): ?>
                                        <input type="hidden" name="action" value="unblock">
                                        <button type="submit" style="background:none;border:none;color:#16a34a;cursor:pointer;padding:0;font:inherit;">Unblock</button>
                                    <?php else: ?>
                                        <input type="hidden" name="action" value="block">
                                        <button type="submit" style="background:none;border:none;color:#ca8a04;cursor:pointer;padding:0;font:inherit;" onclick="return confirm('Block this user?');">Block</button>
                                    <?php endif; ?>
                                </form>
                                ·
                                <form method="post" action="user-delete.php" style="display:inline;" onsubmit="return confirm('Delete this user? Their posts will be removed (cascade).');">
                                    <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                                    <input type="hidden" name="id" value="<?php echo (int) $r['id']; ?>">
                                    <button type="submit" style="background:none;border:none;color:#dc2626;cursor:pointer;padding:0;font:inherit;">Delete</button>
                                </form>
                                <?php if (($r['role'] ?? '') === 'member'): ?>
                                    ·
                                    <?php if (empty($r['verified_at'])): ?>
                                        <form method="post" action="user-verify.php" style="display:inline;">
                                            <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                                            <input type="hidden" name="id" value="<?php echo (int) $r['id']; ?>">
                                            <input type="hidden" name="action" value="verify">
                                            <button type="submit" style="background:none;border:none;color:#16a34a;cursor:pointer;padding:0;font:inherit;">Approve</button>
                                        </form>
                                    <?php else: ?>
                                        <form method="post" action="user-verify.php" style="display:inline;" onsubmit="return confirm('Revoke posting approval for this member?');">
                                            <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                                            <input type="hidden" name="id" value="<?php echo (int) $r['id']; ?>">
                                            <input type="hidden" name="action" value="unverify">
                                            <button type="submit" style="background:none;border:none;color:#64748b;cursor:pointer;padding:0;font:inherit;">Revoke</button>
                                        </form>
                                    <?php endif; ?>
                                <?php endif; ?>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr><td colspan="9">No users.</td></tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
