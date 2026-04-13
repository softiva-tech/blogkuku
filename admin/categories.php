<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_admin();

$page_title = 'Categories';
include __DIR__ . '/includes/layout-start.php';

$q = $conn->query('SELECT id, name, slug, sort_order, created_at FROM categories ORDER BY sort_order ASC, name ASC');
?>

<div class="admin-top">
    <h1>Post categories</h1>
    <a href="category-form.php" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add category</a>
</div>

<p style="color:#64748b;margin:-0.5rem 0 1rem;font-size:0.95rem;">Authors choose from these categories when writing posts. Delete only if no posts use the category (or posts will lose the link).</p>

<div class="admin-table-wrap">
    <table class="admin-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Slug (URL)</th>
                <th>Sort</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <?php if ($q && $q->num_rows): ?>
                <?php while ($r = $q->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo e($r['name']); ?></td>
                        <td><code><?php echo e($r['slug']); ?></code></td>
                        <td><?php echo (int) $r['sort_order']; ?></td>
                        <td style="white-space:nowrap;">
                            <a href="category-form.php?id=<?php echo (int) $r['id']; ?>">Edit</a>
                            ·
                            <form method="post" action="category-delete.php" style="display:inline;" onsubmit="return confirm('Delete this category?');">
                                <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
                                <input type="hidden" name="id" value="<?php echo (int) $r['id']; ?>">
                                <button type="submit" style="background:none;border:none;color:#dc2626;cursor:pointer;padding:0;font:inherit;">Delete</button>
                            </form>
                        </td>
                    </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr><td colspan="4">No categories. <a href="category-form.php">Add one</a>.</td></tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
