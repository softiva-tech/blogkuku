<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_posting_access();

$page_title = 'Posts';
include __DIR__ . '/includes/layout-start.php';

$role = current_user()['role'];
$uid = (int) current_user()['id'];
$verified = user_has_verified_posting_rights($conn, $uid);

if ($role === 'member') {
    $stmt = $conn->prepare("
        SELECT p.id, p.title, p.slug, p.status, p.published_at, p.updated_at, u.username, c.name AS category_name
        FROM blog_posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.author_id = ?
        ORDER BY p.updated_at DESC
    ");
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $q = $stmt->get_result();
} else {
    $q = $conn->query("
        SELECT p.id, p.title, p.slug, p.status, p.published_at, p.updated_at, u.username, c.name AS category_name
        FROM blog_posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.updated_at DESC
    ");
}
?>

<div class="admin-top">
    <h1><?php echo $role === 'member' ? 'My posts' : 'All posts'; ?></h1>
    <?php if ($verified): ?>
        <a href="post-form.php" class="btn btn-primary"><i class="fa-solid fa-plus"></i> New post</a>
    <?php endif; ?>
</div>

<?php if (!$verified && $role === 'member'): ?>
    <div class="alert alert-error" style="margin-bottom:1rem;">
        Your account is not approved for posting yet. <a href="pending-verification.php">Details</a>
    </div>
<?php endif; ?>

<div class="admin-table-wrap">
    <table class="admin-table">
        <thead>
            <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published</th>
                <th>Author</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <?php if ($q && $q->num_rows): ?>
                <?php while ($r = $q->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo e($r['title']); ?></td>
                        <td><?php echo e($r['category_name'] ?? '—'); ?></td>
                        <td><?php echo e($r['status']); ?></td>
                        <td><?php echo e($r['published_at'] ?? '—'); ?></td>
                        <td><?php echo e($r['username']); ?></td>
                        <td style="white-space:nowrap;">
                            <?php if ($verified): ?>
                                <a href="post-form.php?id=<?php echo (int) $r['id']; ?>">Edit</a>
                                <?php if ($r['status'] === 'published'): ?>
                                    · <a href="../blog-post.php?slug=<?php echo urlencode($r['slug']); ?>" target="_blank" rel="noopener">View</a>
                                <?php endif; ?>
                                ·
                                <form method="post" action="post-delete.php" style="display:inline;" onsubmit="return confirm('Delete this post?');">
                                    <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                                    <input type="hidden" name="id" value="<?php echo (int) $r['id']; ?>">
                                    <button type="submit" style="background:none;border:none;color:#dc2626;cursor:pointer;padding:0;font:inherit;">Delete</button>
                                </form>
                            <?php else: ?>
                                —
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr><td colspan="6"><?php echo $verified ? 'No posts. <a href="post-form.php">Create your first post</a>.' : 'No posts yet.'; ?></td></tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
