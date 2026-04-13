<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_posting_access();
require_once dirname(__DIR__) . '/includes/post_image_helpers.php';

if (!user_has_verified_posting_rights($conn, (int) current_user()['id'])) {
    header('Location: pending-verification.php');
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$post = null;
if ($id > 0) {
    $st = $conn->prepare('SELECT * FROM blog_posts WHERE id = ? LIMIT 1');
    $st->bind_param('i', $id);
    $st->execute();
    $post = $st->get_result()->fetch_assoc();
    if (!$post) {
        redirect('posts.php');
    }
    $role = current_user()['role'];
    if ($role === 'member' && (int) $post['author_id'] !== (int) current_user()['id']) {
        redirect('posts.php');
    }
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['_csrf'] ?? '')) {
        $error = 'Invalid session.';
    } else {
        $title = trim((string) ($_POST['title'] ?? ''));
        $slug_in = trim((string) ($_POST['slug'] ?? ''));
        $excerpt = trim((string) ($_POST['excerpt'] ?? ''));
        $content = trim((string) ($_POST['content'] ?? ''));
        $video_url = trim((string) ($_POST['video_url'] ?? ''));
        $category_id_raw = isset($_POST['category_id']) ? trim((string) $_POST['category_id']) : '';
        $category_id = $category_id_raw === '' ? null : (int) $category_id_raw;
        $status = ($_POST['status'] ?? '') === 'published' ? 'published' : 'draft';
        $remove_featured = !empty($_POST['remove_featured_image']);

        if ($category_id !== null) {
            $cchk = $conn->prepare('SELECT id FROM categories WHERE id = ? LIMIT 1');
            $cchk->bind_param('i', $category_id);
            $cchk->execute();
            if ($cchk->get_result()->num_rows === 0) {
                $error = 'Invalid category.';
                $category_id = null;
            }
        }

        if ($title === '' || $content === '') {
            $error = 'Title and content are required.';
        } elseif ($id === 0 && !user_can_create_post($conn, (int) current_user()['id'])) {
            $error = 'Daily post limit reached, or you cannot post yet. Try again tomorrow or contact an admin.';
        } elseif ($id > 0 && current_user()['role'] === 'member' && (int) $post['author_id'] !== (int) current_user()['id']) {
            $error = 'You cannot edit this post.';
        }

        if ($error === '') {
            $featuredPath = ($id > 0 && !empty($post['featured_image'])) ? $post['featured_image'] : null;

            if ($remove_featured) {
                delete_post_image_file($featuredPath);
                $featuredPath = null;
            }

            $up = save_post_featured_upload($_FILES['featured_image'] ?? []);
            if (!$up['ok']) {
                $error = $up['error'] ?? 'Upload error.';
            } elseif (!empty($up['path'])) {
                delete_post_image_file($featuredPath);
                $featuredPath = $up['path'];
            }

            if ($error === '') {
                $slug = $slug_in !== ''
                    ? unique_post_slug($conn, $slug_in, $id > 0 ? $id : null)
                    : unique_post_slug($conn, $title, $id > 0 ? $id : null);
                $author_id = (int) current_user()['id'];
                $published_at = null;
                if ($status === 'published') {
                    if ($post && !empty($post['published_at'])) {
                        $published_at = $post['published_at'];
                    } else {
                        $published_at = date('Y-m-d H:i:s');
                    }
                }

                if ($id > 0) {
                    if ($status === 'draft') {
                        $pu = $post['published_at'] ?? null;
                    } else {
                        $pu = $published_at;
                    }
                    $stmt = $conn->prepare('UPDATE blog_posts SET title=?, slug=?, excerpt=?, content=?, video_url=?, featured_image=?, category_id=?, status=?, published_at=? WHERE id=?');
                    $vu = $video_url === '' ? null : $video_url;
                    $ex = $excerpt === '' ? null : $excerpt;
                    $fi = $featuredPath;
                    $stmt->bind_param(
                        str_repeat('s', 6) . 'issi',
                        $title,
                        $slug,
                        $ex,
                        $content,
                        $vu,
                        $fi,
                        $category_id,
                        $status,
                        $pu,
                        $id
                    );
                    if ($stmt->execute()) {
                        $success = 'Post updated.';
                        $st = $conn->prepare('SELECT * FROM blog_posts WHERE id = ?');
                        $st->bind_param('i', $id);
                        $st->execute();
                        $post = $st->get_result()->fetch_assoc();
                    } else {
                        $error = 'Could not save (duplicate slug?).';
                    }
                } else {
                    $vu = $video_url === '' ? null : $video_url;
                    $ex = $excerpt === '' ? null : $excerpt;
                    $pu = $status === 'published' ? date('Y-m-d H:i:s') : null;
                    $fi = $featuredPath;
                    $stmt = $conn->prepare('INSERT INTO blog_posts (title, slug, excerpt, content, video_url, featured_image, category_id, status, author_id, published_at) VALUES (?,?,?,?,?,?,?,?,?,?)');
                    $stmt->bind_param(
                        str_repeat('s', 6) . 'isis',
                        $title,
                        $slug,
                        $ex,
                        $content,
                        $vu,
                        $fi,
                        $category_id,
                        $status,
                        $author_id,
                        $pu
                    );
                    if ($stmt->execute()) {
                        redirect('post-form.php?id=' . $stmt->insert_id);
                    }
                    $error = 'Could not create post.';
                }
            }
        }
    }
}

$page_title = $post ? 'Edit post' : 'New post';
include __DIR__ . '/includes/layout-start.php';

$catsRes = $conn->query('SELECT id, name FROM categories ORDER BY sort_order ASC, name ASC');

$v = $post ?? [
    'title' => '',
    'slug' => '',
    'excerpt' => '',
    'content' => '',
    'video_url' => '',
    'featured_image' => '',
    'category_id' => null,
    'status' => 'draft',
];
$selCat = isset($v['category_id']) ? (int) $v['category_id'] : 0;
?>

<div class="admin-top">
    <div>
        <h1><?php echo $post ? 'Edit post' : 'New post'; ?></h1>
        <?php
        $uid = (int) current_user()['id'];
        $rrole = current_user()['role'];
        if ($rrole !== 'admin' && !$post) {
            $lim = user_effective_daily_limit($conn, $uid);
            $today = posts_created_today($conn, $uid);
            if ($lim === -1) {
                echo '<p style="margin:0.35rem 0 0;color:#64748b;font-size:0.88rem;">Daily limit: unlimited · Created today: ' . (int) $today . '</p>';
            } elseif ($lim === 0) {
                echo '<p style="margin:0.35rem 0 0;color:#b45309;font-size:0.88rem;">You cannot create new posts (limit 0). Contact an admin.</p>';
            } else {
                echo '<p style="margin:0.35rem 0 0;color:#64748b;font-size:0.88rem;">Daily limit: ' . (int) $today . ' / ' . (int) $lim . ' posts created today</p>';
            }
        }
        ?>
    </div>
    <a href="posts.php" class="btn btn-secondary">Back to list</a>
</div>

<?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
<?php if ($success): ?><div class="alert alert-success"><?php echo e($success); ?></div><?php endif; ?>

<div class="form-card">
    <form method="post" action="" enctype="multipart/form-data">
        <input type="hidden" name="_csrf" value="<?php echo e(csrf_token()); ?>">
        <div class="form-group">
            <label for="title">Title</label>
            <input id="title" name="title" required value="<?php echo e($v['title']); ?>">
        </div>
        <div class="form-group">
            <label for="slug">Slug (optional)</label>
            <input id="slug" name="slug" value="<?php echo e($v['slug']); ?>" placeholder="auto from title">
            <p class="form-hint">URL segment: <code>blog-post.php?slug=…</code></p>
        </div>
        <div class="form-group">
            <label for="featured_image">Featured image</label>
            <?php if (!empty($v['featured_image'])): ?>
                <div style="margin-bottom:0.75rem;">
                    <img src="../<?php echo e($v['featured_image']); ?>" alt="" style="max-width:100%;max-height:200px;border-radius:8px;object-fit:cover;">
                </div>
                <label style="font-weight:normal;display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
                    <input type="checkbox" name="remove_featured_image" value="1"> Remove current image
                </label>
            <?php endif; ?>
            <input id="featured_image" name="featured_image" type="file" accept="image/jpeg,image/png,image/webp,image/gif">
            <p class="form-hint">JPEG, PNG, WebP, or GIF — max 5MB.</p>
        </div>
        <div class="form-group">
            <label for="excerpt">Excerpt</label>
            <textarea id="excerpt" name="excerpt" rows="3"><?php echo e($v['excerpt'] ?? ''); ?></textarea>
        </div>
        <div class="form-group">
            <label for="video_url">Video URL</label>
            <input id="video_url" name="video_url" type="url" placeholder="https://www.youtube.com/watch?v=… or Vimeo" value="<?php echo e($v['video_url'] ?? ''); ?>">
        </div>
        <div class="form-group">
            <label for="category_id">Category</label>
            <select id="category_id" name="category_id">
                <option value="">— None —</option>
                <?php if ($catsRes): ?>
                    <?php while ($c = $catsRes->fetch_assoc()): ?>
                        <option value="<?php echo (int) $c['id']; ?>" <?php echo $selCat === (int) $c['id'] ? 'selected' : ''; ?>><?php echo e($c['name']); ?></option>
                    <?php endwhile; ?>
                <?php endif; ?>
            </select>
            <p class="form-hint">Managed under <a href="categories.php">Categories</a> (admin).</p>
        </div>
        <div class="form-group">
            <label for="content">Content</label>
            <textarea id="content" name="content" required rows="14"><?php echo e($v['content']); ?></textarea>
            <p class="form-hint">Plain text or safe HTML.</p>
        </div>
        <div class="form-group">
            <label for="status">Status</label>
            <select id="status" name="status">
                <option value="draft" <?php echo ($v['status'] ?? '') === 'draft' ? 'selected' : ''; ?>>Draft</option>
                <option value="published" <?php echo ($v['status'] ?? '') === 'published' ? 'selected' : ''; ?>>Published</option>
            </select>
        </div>
        <button type="submit" class="btn btn-primary">Save</button>
    </form>
</div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
