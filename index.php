<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$featured = null;
$latest = [];
$categories = [];

$q = $conn->query("
    SELECT p.*, u.username AS author_name, c.name AS category_name, c.slug AS category_slug
    FROM blog_posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.status = 'published'
    ORDER BY p.published_at DESC
    LIMIT 12
");
if ($q) {
    $rows = [];
    while ($r = $q->fetch_assoc()) {
        $rows[] = $r;
    }
    if (!empty($rows)) {
        $featured = $rows[0];
        $latest = array_slice($rows, 1, 7);
    }
}

$catQ = $conn->query('SELECT name, slug FROM categories ORDER BY sort_order ASC, name ASC');
if ($catQ) {
    while ($c = $catQ->fetch_assoc()) {
        $categories[] = $c;
    }
}

$page_title = 'Home — Never Quit Punjabi';
$assets_prefix = '';
include __DIR__ . '/includes/header.php';
?>

<section class="hero hero--home">
    <div class="container hero__grid">
        <div>
            <h1>“Rooted in Tradition, Rising in Punjabi.”</h1>
            <p class="hero__lead">“Punjabi is more than a language — it’s a legacy of stories, music, and identity. We bring together tradition and today’s world, helping Punjabi grow, evolve, and shine globally.”.</p>
            <div class="hero__cta">
                <a href="blog.php" class="btn btn-primary">Browse all posts</a>
                <a href="admin/login.php" class="btn btn-ghost">Manage content</a>
            </div>
        </div>
        <?php if ($featured): ?>
            <?php
            $hasVideo = video_embed_url($featured['video_url'] ?? '') !== null;
            $hasImg = !empty($featured['featured_image']);
            ?>
            <article class="card">
                <a href="blog-post.php?slug=<?php echo urlencode($featured['slug']); ?>" class="card__media <?php echo $hasVideo ? 'card__media--video' : ''; ?><?php echo $hasImg ? ' card__media--has-image' : ''; ?>" style="text-decoration:none;color:inherit;">
                    <?php if ($hasImg): ?>
                        <img class="post-card__img" src="<?php echo e($featured['featured_image']); ?>" alt="<?php echo e($featured['title']); ?>" loading="eager">
                    <?php endif; ?>
                    <?php if ($hasVideo): ?>
                        <span class="card__play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
                    <?php elseif (!$hasImg): ?>
                        <i class="fa-solid fa-newspaper" aria-hidden="true"></i>
                    <?php endif; ?>
                </a>
                <div class="card__body">
                    <div class="card__meta">
                        <?php if (!empty($featured['category_name'])): ?>
                            <span class="badge"><?php echo e($featured['category_name']); ?></span>
                        <?php endif; ?>
                        <span><?php echo $featured['published_at'] ? date('M j, Y', strtotime($featured['published_at'])) : ''; ?></span>
                    </div>
                    <h3><a href="blog-post.php?slug=<?php echo urlencode($featured['slug']); ?>"><?php echo e($featured['title']); ?></a></h3>
                    <p class="card__excerpt"><?php echo e($featured['excerpt'] ?: substr(strip_tags($featured['content']), 0, 160) . '…'); ?></p>
                    <a href="blog-post.php?slug=<?php echo urlencode($featured['slug']); ?>" class="card__link">Read article <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </article>
        <?php else: ?>
            <div class="card">
                <div class="card__body">
                    <h3>No posts yet</h3>
                    <p class="card__excerpt">Run <code>setup.php</code>, sign in to the admin, and publish your first story.</p>
                    <a href="admin/login.php" class="card__link">Go to admin</a>
                </div>
            </div>
        <?php endif; ?>
    </div>
</section>

<section class="home-columns">
    <div class="container home-columns__grid">
        <div class="home-col home-col--1">
            <h2 class="col-title">Spotlight</h2>
            <?php if ($featured): ?>
                <article class="card">
                    <?php if (!empty($featured['featured_image'])): ?>
                        <a href="blog-post.php?slug=<?php echo urlencode($featured['slug']); ?>" class="card__media card__media--has-image" style="text-decoration:none;color:inherit;aspect-ratio:2/1;">
                            <img class="post-card__img" src="<?php echo e($featured['featured_image']); ?>" alt="<?php echo e($featured['title']); ?>" loading="lazy">
                        </a>
                    <?php endif; ?>
                    <div class="card__body">
                        <div class="card__meta">
                            <?php if (!empty($featured['category_name'])): ?>
                                <span class="badge"><?php echo e($featured['category_name']); ?></span>
                            <?php endif; ?>
                            <span>By <?php echo e($featured['author_name']); ?></span>
                        </div>
                        <h3><a href="blog-post.php?slug=<?php echo urlencode($featured['slug']); ?>"><?php echo e($featured['title']); ?></a></h3>
                        <p class="card__excerpt"><?php echo e($featured['excerpt'] ?: substr(strip_tags($featured['content']), 0, 200) . '…'); ?></p>
                        <a href="blog-post.php?slug=<?php echo urlencode($featured['slug']); ?>" class="card__link">Open post <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </article>
            <?php else: ?>
                <p class="card__excerpt" style="padding:1rem 0;">Publish a post to see it here.</p>
            <?php endif; ?>
        </div>

        <div class="home-col home-col--2">
            <h2 class="col-title">Latest</h2>
            <?php if (!empty($latest)): ?>
                <ul class="post-list">
                    <?php foreach ($latest as $post): ?>
                        <?php
                        $v = video_embed_url($post['video_url'] ?? '') !== null;
                        $thumb = !empty($post['featured_image']) ? $post['featured_image'] : null;
                        ?>
                        <li class="post-list__item">
                            <div class="post-list__thumb<?php echo $thumb ? ' post-list__thumb--photo' : ''; ?>" aria-hidden="true">
                                <?php if ($thumb): ?>
                                    <img src="<?php echo e($thumb); ?>" alt="">
                                <?php elseif ($v): ?>
                                    <i class="fa-solid fa-circle-play"></i>
                                <?php else: ?>
                                    <i class="fa-solid fa-file-lines"></i>
                                <?php endif; ?>
                            </div>
                            <div class="post-list__body">
                                <h4><a href="blog-post.php?slug=<?php echo urlencode($post['slug']); ?>"><?php echo e($post['title']); ?></a></h4>
                                <div class="post-list__meta">
                                    <?php echo $post['published_at'] ? date('M j, Y', strtotime($post['published_at'])) : ''; ?>
                                    <?php if (!empty($post['category_name'])): ?> · <?php echo e($post['category_name']); ?><?php endif; ?>
                                </div>
                            </div>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php else: ?>
                <p class="card__excerpt">No additional posts yet.</p>
            <?php endif; ?>
            <a href="blog.php" class="btn btn-secondary" style="margin-top:1rem;">View full blog</a>
        </div>

        <div class="home-col home-col--3">
            <h2 class="col-title">Topics</h2>
            <div class="sidebar-block">
                <h3>Categories</h3>
                <?php if (!empty($categories)): ?>
                    <div class="tag-cloud">
                        <?php foreach ($categories as $cat): ?>
                            <a href="blog.php?category=<?php echo urlencode($cat['slug']); ?>"><?php echo e($cat['name']); ?></a>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <p style="margin:0;font-size:0.9rem;color:var(--muted);">Add categories in the admin area, then assign them to posts.</p>
                <?php endif; ?>
            </div>
            <div class="sidebar-block">
                <h3>About this site</h3>
                <p style="margin:0;font-size:0.9rem;color:var(--muted);">Responsive layout, optional video embeds (YouTube &amp; Vimeo), and a secure admin area backed by MySQL.</p>
            </div>
        </div>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
