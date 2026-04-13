<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_posting_access();

$page_title = 'Dashboard';
include __DIR__ . '/includes/layout-start.php';

$role = current_user()['role'];
$uid = (int) current_user()['id'];

if ($role === 'member') {
    $published = (int) $conn->query("SELECT COUNT(*) AS c FROM blog_posts WHERE status = 'published' AND author_id = {$uid}")->fetch_assoc()['c'];
    $drafts = (int) $conn->query("SELECT COUNT(*) AS c FROM blog_posts WHERE status = 'draft' AND author_id = {$uid}")->fetch_assoc()['c'];
    $recent = $conn->query("
        SELECT p.id, p.title, p.status, p.published_at, p.updated_at, u.username
        FROM blog_posts p
        JOIN users u ON u.id = p.author_id
        WHERE p.author_id = {$uid}
        ORDER BY p.updated_at DESC
        LIMIT 8
    ");
} else {
    $published = (int) $conn->query("SELECT COUNT(*) AS c FROM blog_posts WHERE status = 'published'")->fetch_assoc()['c'];
    $drafts = (int) $conn->query("SELECT COUNT(*) AS c FROM blog_posts WHERE status = 'draft'")->fetch_assoc()['c'];
    $recent = $conn->query("
        SELECT p.id, p.title, p.status, p.published_at, p.updated_at, u.username
        FROM blog_posts p
        JOIN users u ON u.id = p.author_id
        ORDER BY p.updated_at DESC
        LIMIT 8
    ");
}
$users = (int) $conn->query("SELECT COUNT(*) AS c FROM users")->fetch_assoc()['c'];
$pendingMembers = 0;
if ($role === 'admin') {
    $pendingMembers = (int) $conn->query("SELECT COUNT(*) AS c FROM users WHERE role = 'member' AND verified_at IS NULL")->fetch_assoc()['c'];
}

$lim = user_effective_daily_limit($conn, $uid);
$today = posts_created_today($conn, $uid);
$remaining = $lim === -1 ? 'Unlimited' : ($lim === 0 ? '0 (posting disabled)' : max(0, $lim - $today) . ' left today');
?>

<div class="admin-top">
    <h1>Dashboard</h1>
    <span style="color:#64748b;font-size:0.9rem;">Signed in as <strong><?php echo e(current_user()['username']); ?></strong>
        <?php if ($role !== 'admin'): ?> · Posts today: <?php echo (int) $today; ?> / <?php echo $lim === -1 ? '∞' : (int) $lim; ?> (<?php echo e($remaining); ?>)<?php endif; ?>
    </span>
</div>

<?php if ($role === 'member' && !user_has_verified_posting_rights($conn, $uid)): ?>
    <div class="alert alert-error" style="margin-bottom:1rem;max-width:720px;">
        Your account is <strong>pending approval</strong>. You cannot create or edit posts until an administrator approves you.
        <a href="pending-verification.php" style="margin-left:0.5rem;">Details</a>
    </div>
<?php endif; ?>

<?php if ($role === 'admin' && $pendingMembers > 0): ?>
    <div class="alert alert-error" style="margin-bottom:1rem;max-width:720px;">
        <strong><?php echo (int) $pendingMembers; ?></strong> member account(s) awaiting posting approval.
        <a href="users.php" style="margin-left:0.5rem;">Review users</a>
    </div>
<?php endif; ?>

<div class="admin-cards">
    <div class="stat-card"><strong><?php echo $published; ?></strong><span>Published posts</span></div>
    <div class="stat-card"><strong><?php echo $drafts; ?></strong><span>Drafts</span></div>
    <?php if ($role === 'admin'): ?>
        <div class="stat-card"><strong><?php echo $users; ?></strong><span>Users</span></div>
        <?php if ($pendingMembers > 0): ?>
            <div class="stat-card" style="border-color:#fecaca;"><strong><?php echo (int) $pendingMembers; ?></strong><span>Pending approval</span></div>
        <?php endif; ?>
    <?php endif; ?>
</div>

<h2 style="font-size:1.1rem;margin-bottom:0.75rem;">Recent posts</h2>
<div class="admin-table-wrap">
    <table class="admin-table">
        <thead>
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <?php if ($recent && $recent->num_rows): ?>
                <?php while ($r = $recent->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo e($r['title']); ?></td>
                        <td><?php echo e($r['username']); ?></td>
                        <td><?php echo e($r['status']); ?></td>
                        <td><?php echo e($r['updated_at']); ?></td>
                        <td><a href="post-form.php?id=<?php echo (int) $r['id']; ?>">Edit</a></td>
                    </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr><td colspan="5">No posts yet. <a href="post-form.php">Create one</a>.</td></tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
