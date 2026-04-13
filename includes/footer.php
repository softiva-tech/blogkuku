    </main>
    <?php
    if (!function_exists('e')) {
        require_once __DIR__ . '/functions.php';
    }
    $footer_asset_base = (isset($assets_prefix) && $assets_prefix === '..') ? '../assets/' : 'assets/';
    $footer_site_name = 'Never Quit Punjabi';
    ?>
    <footer class="site-footer">
        <div class="container site-footer__inner">
            <a class="site-footer__logo-link" href="<?php echo e((isset($assets_prefix) && $assets_prefix === '..') ? '../index.php' : 'index.php'); ?>">
                <span class="logo-frame logo-frame--footer" aria-hidden="true">
                    <img src="<?php echo e($footer_asset_base); ?>images/logo.png" width="160" height="160" alt="">
                </span>
                <span class="visually-hidden"><?php echo e($footer_site_name); ?></span>
            </a>
            <p>&copy; <?php echo date('Y'); ?> <?php echo e($footer_site_name); ?>. Built by Kuku Software Developers</p>
        </div>
    </footer>
    <script src="<?php echo e($footer_asset_base); ?>js/main.js"></script>
</body>
</html>
