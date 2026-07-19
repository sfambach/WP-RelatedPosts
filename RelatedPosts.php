<?php
/**
 * Plugin Name:       WP-RelatedPosts
 * Description:       Ein nativer Gutenberg-Block für verwandte Beiträge.
 * Version:           1.0.1
 * Author:            sfambach & AI Assistant
 * License:           GPL-2.0+
 * GitHub Plugin URI: https://github.com
 * Primary Branch:    main
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Registriert den Block und verknüpft die Render-Funktion für das Frontend.
 */
function fambach_related_posts_block_init() {
    register_block_type( __DIR__, array(
        'render_callback' => 'fambach_render_related_posts_block',
    ) );
}
add_action( 'init', 'fambach_related_posts_block_init' );

/**
 * Render-Callback für die Ausgabe im Frontend.
 */
function fambach_render_related_posts_block( $attributes ) {
    // Prüfen, ob die Funktion im Backend oder der Schalter auf FALSE steht
    if ( is_admin() || empty( $attributes['beitraege_aktivieren'] ) ) {
        return '';
    }

    // Variablen-Zuweisung und Fallbacks
    $anzahl = isset( $attributes['anzahl_beitraege'] ) ? (int) $attributes['anzahl_beitraege'] : 5;
    $heading_tag = isset( $attributes['ueberschrift_typ'] ) ? $attributes['ueberschrift_typ'] : 'h3';

    // Erweiterter Sicherheits-Schutz Whitelist
    if ( ! in_array( $heading_tag, array( 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' ), true ) ) {
        $heading_tag = 'h3';
    }
    
    // Die ID des aktuellen Beitrags ermitteln
    $current_post_id = get_the_ID();
    if ( ! $current_post_id ) {
        return '';
    }

    // Kategorien des aktuellen Beitrags holen
    $categories = wp_get_post_categories( $current_post_id );
    if ( empty( $categories ) ) {
        return '<p class="related-posts-empty">Keine verwandten Kategorien gefunden.</p>';
    }

    // WP_Query Argumente aufbauen
    $args = array(
        'post_type'      => 'post',
        'posts_per_page' => $anzahl, // Nutzt die ausgewählte Anzahl
        'post__not_in'   => array( $current_post_id ),
        'category__in'   => $categories,
        'orderby'        => 'modified',
        'order'          => 'DESC',
    );

    $related_query = new WP_Query( $args );
    $output = '';

    if ( $related_query->have_posts() ) {
        $output .= '<div class="wp-block-fambach-related-posts">';
        
        // Generiert die dynamische Überschrift
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
