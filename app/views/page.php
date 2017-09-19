<!DOCTYPE html>
<!--[if lte IE 9 ]> <html class="ie"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class=""> <!--<![endif]-->
<head>
    <title><?= single_post_title() ?> <?= site_title() ?></title>
    <link rel="alternate" type="application/rss+xml" title="<?= site_title() ?>'s Feed" href="/feed" />
    <link rel="stylesheet" href="/assets/reset.css">
    <link rel="stylesheet" href="/assets/common.css">
    <link rel="stylesheet" href="/assets/main.css">
    <link rel="stylesheet" href="/assets/page.css">
    <link rel="stylesheet" href="/assets/font.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script src="/assets/vendor/jquery-1.11.2.min.js"></script>
    <script src="/assets/slices.js"></script>

    <?php include('prismic.php') ?>

    <?php include('skin/page.php') ?>

</head>
    
<script type="text/javascript" src="https://weglot.com/api/weglot.js"></script>
<script>
	Weglot.setup({
	  api_key: 'wg_c3cd6d3b53d9bec47ddeb533584ccc61',
	  originalLanguage: 'fr',
	  destinationLanguages : 'en,es',
	 });
</script>

<body class="page <?= is_home() ? "home" : "" ?>">

<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.7";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>



    <div class="main" <?= the_wio_attributes(); ?>>

        <?php while (have_posts()) : the_post(); ?>

        <div id="page-content">

            <?php page_content() ?>

        </div>


<?php endwhile; // end of the loop. ?>

<?php get_footer() ?>
