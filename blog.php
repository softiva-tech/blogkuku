<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$category_slug = isset($_GET['category']) ? trim((string) $_GET['category']) : '';
$search_query = isset($_GET['search']) ? trim((string) $_GET['search']) : '';

$query = "
    SELECT p.*, u.username AS author_name, c.name AS category_name, c.slug AS category_slug
    FROM blog_posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.status = 'published'
";
$params = [];
$types = '';

if ($category_slug !== '') {
    $query .= ' AND c.slug = ?';
    $params[] = $category_slug;
    $types .= 's';
}

if ($search_query !== '') {
    $query .= ' AND (p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)';
    $search_term = '%' . $search_query . '%';
    $params[] = $search_term;
    $params[] = $search_term;
    $params[] = $search_term;
    $types .= 'sss';
}

$query .= ' ORDER BY p.published_at DESC LIMIT 24';

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$categories_result = $conn->query('SELECT name, slug FROM categories ORDER BY sort_order ASC, name ASC');

$page_title = 'Blog — Never Quit Punjabi';
$assets_prefix = '';
include __DIR__ . '/includes/header.php';
?>

<section class="page-header">
    <div class="container">
        <h1>Our blog</h1>
        <p>Articles, updates, and stories — including posts with video.</p>
    </div>
</section>

<section class="content-section">
    <div class="container">
        <div class="blog-toolbar">
            <form method="get" action="blog.php">
                <?php if ($category_slug !== ''): ?>
                    <input type="hidden" name="category" value="<?php echo e($category_slug); ?>">
                <?php endif; ?>
                <input type="text" name="search" placeholder="Search articles…" value="<?php echo e($search_query); ?>" aria-label="Search">
                <button type="submit" class="btn btn-primary" aria-label="Search"><i class="fa-solid fa-magnifying-glass"></i></button>
            </form>
            <div class="filter-pills">
                <a href="blog.php" class="btn <?php echo $category_slug === '' ? 'btn-primary' : 'btn-secondary'; ?>">All</a>
                <?php if ($categories_result): ?>
                    <?php while ($cat = $categories_result->fetch_assoc()): ?>
                        <a href="blog.php?category=<?php echo urlencode($cat['slug']); ?>" class="btn <?php echo $category_slug === $cat['slug'] ? 'btn-primary' : 'btn-secondary'; ?>">
                            <?php echo e($cat['name']); ?>
                        </a>
                    <?php endwhile; ?>
                <?php endif; ?>
            </div>
        </div>

        <?php if ($result->num_rows > 0): ?>
            <div class="blog-grid">
                <?php while ($post = $result->fetch_assoc()): ?>
                    <?php
                    $hasVideo = video_embed_url($post['video_url'] ?? '') !== null;
                    $hasImg = !empty($post['featured_image']);
                    ?>
                    <article class="blog-card card">
                        <a href="blog-post.php?slug=<?php echo urlencode($post['slug']); ?>" class="card__media <?php echo $hasVideo ? 'card__media--video' : ''; ?><?php echo $hasImg ? ' card__media--has-image' : ''; ?>" style="text-decoration:none;color:inherit;">
                            <?php if ($hasImg): ?>
                                <img class="post-card__img" src="<?php echo e($post['featured_image']); ?>" alt="<?php echo e($post['title']); ?>" loading="lazy">
                            <?php endif; ?>
                            <?php if ($hasVideo): ?>
                                <span class="card__play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
                            <?php elseif (!$hasImg): ?>
                                <i class="fa-solid fa-newspaper" aria-hidden="true"></i>
                            <?php endif; ?>
                        </a>
                        <div class="card__body">
                            <div class="card__meta">
                                <?php if (!empty($post['category_name'])): ?>
                                    <span class="badge"><?php echo e($post['category_name']); ?></span>
                                <?php endif; ?>
                                <?php if ($hasVideo): ?>
                                    <span class="badge badge--video">Video</span>
                                <?php endif; ?>
                                <span><?php echo $post['published_at'] ? date('M j, Y', strtotime($post['published_at'])) : ''; ?></span>
                            </div>
                            <h3><a href="blog-post.php?slug=<?php echo urlencode($post['slug']); ?>"><?php echo e($post['title']); ?></a></h3>
                            <p class="card__excerpt"><?php echo e($post['excerpt'] ?: substr(strip_tags($post['content']), 0, 150) . '…'); ?></p>
                            <a href="blog-post.php?slug=<?php echo urlencode($post['slug']); ?>" class="card__link">Read more <i class="fa-solid fa-arrow-right"></i></a>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>
        <?php else: ?>
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <h3>No articles found</h3>
                <p>Try another search or category.</p>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
