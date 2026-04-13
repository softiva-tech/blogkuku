<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_admin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$row = null;
if ($id > 0) {
    $st = $conn->prepare('SELECT * FROM categories WHERE id = ? LIMIT 1');
    $st->bind_param('i', $id);
    $st->execute();
    $row = $st->get_result()->fetch_assoc();
    if (!$row) {
        redirect('categories.php');
    }
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['_csrf'] ?? '')) {
        $error = 'Invalid session.';
    } else {
        $name = trim((string) ($_POST['name'] ?? ''));
        $slug_in = trim((string) ($_POST['slug'] ?? ''));
        $sort = (int) ($_POST['sort_order'] ?? 0);
        if ($name === '') {
            $error = 'Name is required.';
        } else {
            $slug = $slug_in !== '' ? unique_category_slug($conn, $slug_in, $id > 0 ? $id : null) : unique_category_slug($conn, $name, $id > 0 ? $id : null);
            if ($id > 0) {
                $chk = $conn->prepare('SELECT id FROM categories WHERE name = ? AND id != ? LIMIT 1');
                $chk->bind_param('si', $name, $id);
            } else {
                $chk = $conn->prepare('SELECT id FROM categories WHERE name = ? LIMIT 1');
                $chk->bind_param('s', $name);
            }
            $chk->execute();
            if ($chk->get_result()->num_rows > 0) {
                $error = 'Another category already uses this name.';
            }
        }
        if ($error === '') {
            if ($id > 0) {
                $up = $conn->prepare('UPDATE categories SET name = ?, slug = ?, sort_order = ? WHERE id = ?');
                $up->bind_param('ssii', $name, $slug, $sort, $id);
                if ($up->execute()) {
                    $success = 'Category updated.';
                    $st = $conn->prepare('SELECT * FROM categories WHERE id = ?');
                    $st->bind_param('i', $id);
                    $st->execute();
                    $row = $st->get_result()->fetch_assoc();
                } else {
                    $error = 'Could not save (slug conflict?).';
                }
            } else {
                $ins = $conn->prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)');
                $ins->bind_param('ssi', $name, $slug, $sort);
                if ($ins->execute()) {
                    redirect('category-form.php?id=' . $ins->insert_id);
                }
                $error = 'Could not create.';
            }
        }
    }
}

$page_title = $row ? 'Edit category' : 'New category';
include __DIR__ . '/includes/layout-start.php';

$v = $row ?? ['name' => '', 'slug' => '', 'sort_order' => 0];
?>

<div class="admin-top">
    <h1><?php echo $row ? 'Edit category' : 'New category'; ?></h1>
    <a href="categories.php" class="btn btn-secondary">Back</a>
</div>

<?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
<?php if ($success): ?><div class="alert alert-success"><?php echo e($success); ?></div><?php endif; ?>

<div class="form-card">
    <form method="post">
        <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
        <div class="form-group">
            <label for="name">Name</label>
            <input id="name" name="name" required value="<?php echo e($v['name']); ?>">
        </div>
        <div class="form-group">
            <label for="slug">Slug</label>
            <input id="slug" name="slug" value="<?php echo e($v['slug']); ?>" placeholder="auto from name">
            <p class="form-hint">Used in URLs: <code>blog.php?category=slug</code></p>
        </div>
        <div class="form-group">
            <label for="sort_order">Sort order</label>
            <input id="sort_order" name="sort_order" type="number" value="<?php echo (int) ($v['sort_order'] ?? 0); ?>">
        </div>
        <button type="submit" class="btn btn-primary">Save</button>
    </form>
</div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
