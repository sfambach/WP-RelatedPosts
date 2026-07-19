<?php
/**
 * Plugin Name:       WP-RelatedPosts
 * Description:       Ein nativer Gutenberg-Block für verwandte Beiträge.
 * Version:           1.1.2
 * Author:            sfambach & AI Assistant
 * License:           GPL-2.0+
 * GitHub Plugin URI: https://github.com
 * Primary Branch:    main
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function fambach_related_posts_block_init() {
    
    wp_register_script(
        'fambach-related-posts-editor-script',
        plugins_url( 'js/block.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data' ),
        '1.1.2',
        true
    );

    register_block_type( __DIR__, array(
        'editor_script'   => 'fambach-related-posts-editor-script',
        'render_callback' => 'fambach_render_related_posts_block',
    ) );
}
add_action( 'init', 'fambach_related_posts_block_init' );

function fambach_render_related_posts_block( $attributes ) {
    $aktiviert = isset( $attributes['beitraege_aktivieren'] ) ? $attributes['beitraege_aktivieren'] : true;
    
    if ( is_admin() || ! $aktiviert ) {
        return '';
    }

    $anzahl = isset( $attributes['anzahl_beitraege'] ) ? (int) $attributes['anzahl_beitraege'] : 5;
    $heading_tag = isset( $attributes['ueberschrift_typ'] ) ? $attributes['ueberschrift_typ'] : 'h3';

    if ( ! in_array( $heading_tag, array( 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' ), true ) ) {
        $heading_tag = 'h3';
    }
    
    $current_post_id = get_the_ID();
    if ( ! $current_post_id ) {
        return '';
    }

    $categories = wp_get_post_categories( $current_post_id );
    if ( empty( $categories ) ) {
        return '<p class="related-posts-empty">Keine verwandten Kategorien gefunden.</p>';
    }

    $args = array(
        'post_type'      => 'post',
        'posts_per_page' => $anzahl,
        'post__not_in'   => array( $current_post_id ),
        'category__in'   => $categories,
        'orderby'        => 'modified',
        'order'          => 'DESC',
    );

    $related_query = new WP_Query( $args );
    $output = '';

    if ( $related_query->have_posts() ) {
        $output .= '<div class="wp-block-fambach-related-posts">';
        $output .= '<' . $heading_tag . ' class="related-posts-title">Das könnte dich auch interessieren:</' . $heading_tag . '>';
        $output .= '<ul>';
        
        while ( $related_query->have_posts() ) {
            $related_query->the_post();
            $output .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
        }
        
        $output .= '</ul>';
        $output .= '</div>';
        
        wp_reset_postdata();
    } else {
        $output .= '<p class="related-posts-empty">Keine ähnlichen Beiträge gefunden.</p>';
    }

    return $output;
}
