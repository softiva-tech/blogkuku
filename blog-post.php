<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$slug = isset($_GET['slug']) ? trim((string) $_GET['slug']) : '';
if ($slug === '') {
    header('HTTP/1.0 404 Not Found');
    $page_title = 'Not found — Never Quit Punjabi';
    $assets_prefix = '';
    include __DIR__ . '/includes/header.php';
    echo '<section class="article-wrap"><div class="container"><p>Missing post.</p><p><a href="blog.php">Back to blog</a></p></div></section>';
    include __DIR__ . '/includes/footer.php';
    exit;
}

$stmt = $conn->prepare("
    SELECT p.*, u.username AS author_name, c.name AS category_name, c.slug AS category_slug
    FROM blog_posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ? AND p.status = 'published'
    LIMIT 1
");
$stmt->bind_param('s', $slug);
$stmt->execute();
$post = $stmt->get_result()->fetch_assoc();

if (!$post) {
    header('HTTP/1.0 404 Not Found');
    $page_title = 'Not found — Never Quit Punjabi';
    $assets_prefix = '';
    include __DIR__ . '/includes/header.php';
    echo '<section class="article-wrap"><div class="container"><h1>Post not found</h1><p><a href="blog.php">Back to blog</a></p></div></section>';
    include __DIR__ . '/includes/footer.php';
    exit;
}

$page_title = $post['title'] . ' — Never Quit Punjabi';
$assets_prefix = '';
$embed = video_embed_url($post['video_url'] ?? '');
$shareUrl = SITE_URL . '/blog-post.php?slug=' . rawurlencode($post['slug']);
$shareTitle = rawurlencode($post['title']);
include __DIR__ . '/includes/header.php';
?>

<section class="article-wrap">
    <div class="container article">
        <div class="article__meta">
            <?php if (!empty($post['category_name'])): ?>
                <span class="badge"><?php echo e($post['category_name']); ?></span>
            <?php endif; ?>
            <span><?php echo $post['published_at'] ? date('F j, Y', strtotime($post['published_at'])) : ''; ?></span>
            <span>By <?php echo e($post['author_name']); ?></span>
        </div>
        <h1><?php echo e($post['title']); ?></h1>
        <?php if (!empty($post['excerpt'])): ?>
            <p class="article__lead"><?php echo e($post['excerpt']); ?></p>
        <?php endif; ?>

        <?php if (!empty($post['featured_image'])): ?>
            <figure class="article__featured">
                <img src="<?php echo e($post['featured_image']); ?>" alt="<?php echo e($post['title']); ?>" loading="eager">
            </figure>
        <?php endif; ?>

        <?php if ($embed): ?>
            <div class="video-embed">
                <iframe src="<?php echo e($embed['src']); ?>"
                    title="Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy"></iframe>
            </div>
        <?php endif; ?>

        <div class="article__content">
            <?php
            $html = $post['content'];
            if (strip_tags($html) === $html) {
                echo '<p>' . nl2br(e($html)) . '</p>';
            } else {
                echo $html;
            }
            ?>
        </div>

        <div class="share-bar" data-share-url="<?php echo e($shareUrl); ?>">
            <span class="share-bar__label">Share</span>
            <a class="share-bar__btn share-bar__btn--x" href="https://twitter.com/intent/tweet?text=<?php echo $shareTitle; ?>&amp;url=<?php echo rawurlencode($shareUrl); ?>" target="_blank" rel="noopener noreferrer" aria-label="Share on X"><i class="fa-brands fa-twitter"></i></a>
            <a class="share-bar__btn share-bar__btn--fb" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode($shareUrl); ?>" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><i class="fa-brands fa-facebook"></i></a>
            <a class="share-bar__btn share-bar__btn--li" href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo rawurlencode($shareUrl); ?>" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
            <a class="share-bar__btn share-bar__btn--wa" href="https://wa.me/?text=<?php echo rawurlencode($post['title'] . ' ' . $shareUrl); ?>" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
            <button type="button" class="share-bar__btn share-bar__btn--copy" data-copy-share aria-label="Copy link"><i class="fa-solid fa-link"></i></button>
        </div>

        <p style="margin-top:2rem;"><a href="blog.php" class="card__link"><i class="fa-solid fa-arrow-left"></i> All posts</a></p>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
