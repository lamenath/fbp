<?php

/**
 * The way the tags are written can lead to the same request being done several times,
 * so make sure that APC is activated so Prismic's default cache is used
 */

// General tags

function get_bloginfo($show = 'name')
{
    global $WPGLOBAL;
    $app = $WPGLOBAL['app'];
    $prismic = $WPGLOBAL['prismic'];
    switch ($show) {
        case 'atom_url':
        case 'rdf_url':
        case 'rss_url':
        case 'rss2_url': return '/feed';
        case 'description': return $prismic->config('site.description');
        case 'wpurl':
        case 'url': return $app->request()->getUrl();
        case 'admin_email': return ADMIN_EMAIL;
        case 'charset': return 'UTF-8';
        case 'language': return 'en-US';
        case 'name': return $prismic->config('site.title');
        default: return '';
    }
}

function bloginfo($show = 'name')
{
    echo get_bloginfo($show);
}

function site_title()
{
    global $WPGLOBAL;
    $prismic = $WPGLOBAL['prismic'];

    return $prismic->config('site.title');
}

function home_url($path = '')
{
    global $WPGLOBAL;
    $app = $WPGLOBAL['app'];

    return $app->request()->getUrl().$path;
}

function wp_title()
{
    echo site_title();
}

function site_description()
{
    global $WPGLOBAL;
    $prismic = $WPGLOBAL['prismic'];

    return $prismic->config('site.description');
}

function the_feed_link($anchor)
{
    return '<a href="/feed">'.$anchor.'</a>';
}

function home_link($label, $attrs = array())
{
    global $WPGLOBAL;
    $app = $WPGLOBAL['app'];
    if ($app->request->getPath() == '/') {
        $attrs['class'] = isset($attrs['class']) ? ($attrs['class'].' active') : 'active';
    }

    return _make_link('/', $label, $attrs);
}

function get_sidebar()
{
    render_include('sidebar');
}

function get_header()
{
    render_include('header');
}

function get_footer()
{
    render_include('footer');
}

function get_search_query()
{
    global $WPGLOBAL;
    $app = $WPGLOBAL['app'];

    return htmlentities($app->request()->params('q'));
}

function get_search_form($echo = true)
{
    $html = '<form method = "get" action = "/search" >
                <input type = "text" placeholder = "search" name = "q" >
            </form >';
    if ($echo) {
        echo $html;
    } else {
        return $html;
    }
}

function get_calendar()
{
    global $WPGLOBAL;
    $prismic = $WPGLOBAL['prismic'];

    return $prismic->get_calendar();
}

function get_template_part($slug, $name = null)
{
    if ($name) {
        render_include($slug.'-'.$name);
    } else {
        render_include($slug);
    }
}

function is_search()
{
    global $WPGLOBAL;
    $app = $WPGLOBAL['app'];
    echo 'look for '.$app->request()->params('q');

    return $app->request()->params('q') != null;
}

function is_single()
{
    global $WPGLOBAL;

    return isset($WPGLOBAL['single_post']);
}

function is_page()
{
    global $WPGLOBAL;

    return isset($WPGLOBAL['page']);
}

function is_singular()
{
    return is_single() || is_page() || is_attachment();
}

function the_blankimage()
{
    if (the_skin() == null) return null;
    return the_skin()->getImage('skin.blank-image') ? the_skin()->getImage('skin.blank-image')->getMain() : null;
}

function the_wio_attributes()
{
    global $WPGLOBAL, $loop;
    $bloghome = isset($WPGLOBAL['bloghome']) ? $WPGLOBAL['bloghome'] : NULL;
    $currentPost = $loop->current_post();
    $page = single_post();
    $doc = $page ? $page : ($currentPost ? $currentPost : $bloghome);
    if (!$doc) {
        return;
    }
    echo 'data-wio-id="'.$doc->getId().'"';
}

// Pismic helper

function the_skin()
{
    global $WPGLOBAL;
    if (isset($WPGLOBAL['skin'])) {
        return $WPGLOBAL['skin'];
    }

    return null;
}

function current_experiment_id()
{
    global $WPGLOBAL;
    $prismic = $WPGLOBAL['prismic'];
    $api = $prismic->get_api();
    $currentExperiment = $api->getExperiments()->getCurrent();

    return $currentExperiment ? $currentExperiment->getGoogleId() : null;
}

function prismic_endpoint()
{
    global $WPGLOBAL;
    $app = $WPGLOBAL['app'];

    return $app->config('prismic.url');
}

// Disqus

function disqus_forum()
{
    global $WPGLOBAL;
    $prismic = $WPGLOBAL['prismic'];

    return $prismic->config('disqus.forum');
}

// Helpers (shouldn't be used in templates)

function _make_link($url, $label, $attrs)
{
    $attrs['href'] = $url;
    $result = '<a ';
    foreach ($attrs as $k => $v) {
        $result .= ($k.'="'.$v.'" ');
    }
    $result .= ('>'.$label.'</a>');

    return $result;
}

// Blog home

function blog_home()
{
    global $WPGLOBAL;
    if (isset($WPGLOBAL['bloghome'])) {
        return $WPGLOBAL['bloghome'];
    }

    return;
}

function blog_home_title()
{
    global $WPGLOBAL;
    $prismic = $WPGLOBAL['prismic'];
    if (!blog_home()) {
        return '';
    }

    return blog_home()->getText('bloghome.headline');
}

function blog_home_description()
{
    global $WPGLOBAL;
    $prismic = $WPGLOBAL['prismic'];
    if (!blog_home()) {
        return '';
    }

    return blog_home()->getText('bloghome.description');
}

function blog_home_image_url()
{
    global $WPGLOBAL;
    $prismic = $WPGLOBAL['prismic'];
    if (!blog_home()) {
        return '';
    }
    $image = blog_home()->getImage('bloghome.image');
    if ($image) {
        return $image->getMain()->getUrl();
    }
}
