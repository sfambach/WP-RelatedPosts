( function ( blocks, element, blockEditor, components, data ) {
    var el = element.createElement;
    var InspectorControls = blockEditor.InspectorControls;
    var useBlockProps = blockEditor.useBlockProps;
    var PanelBody = components.PanelBody;
    var ToggleControl = components.ToggleControl;
    var SelectControl = components.SelectControl;
    var useSelect = data.useSelect;

    blocks.registerBlockType( 'fambach/related-posts', {
        title: 'Related Posts',
        icon: 'list-view',
        category: 'widgets',
        edit: function ( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            // 1. Hole den aktuellen Post-Typ, seine ID und die editierten Kategorien
            var postData = useSelect( function( select ) {
                var editor = select( 'core/editor' );
                return {
                    id: editor ? editor.getCurrentPostId() : null,
                    categories: editor ? ( editor.getEditedPostAttribute( 'categories' ) || [] ) : []
                };
            }, [] );

            // 2. Prüfen, ob der Beitrag ungespeicherte Änderungen hat
            var isPostDirty = useSelect( function( select ) {
                var editor = select( 'core/editor' );
                return editor ? editor.isEditedPostDirty() : false;
            }, [] );

            // 3. Abfrage der echten Kategorienamen
            var fullCategories = useSelect( function( select ) {
                if ( postData.categories.length === 0 ) return [];
                return select( 'core' ).getEntityRecords( 'taxonomy', 'category', { include: postData.categories } ) || [];
            }, [ postData.categories ] );

            // 4. Abfrage der Beitrags-Anzahl
            var relatedPostsCount = useSelect( function( select ) {
                if ( postData.categories.length === 0 ) return 0;
                var queryArgs = {
                    categories: postData.categories,
                    exclude: postData.id ? [ postData.id ] : [],
                    per_page: 100
                };
                var posts = select( 'core' ).getEntityRecords( 'postType', 'post', queryArgs );
                return posts ? posts.length : 0;
            }, [ postData.categories, postData.id ] );

            var sidebarElements = [
                el( ToggleControl, {
                    label: 'Verwandte Beiträge aktivieren',
                    checked: attributes.beitraege_aktivieren,
                    onChange: function ( value ) { setAttributes( { beitraege_aktivieren: value } ); }
                } )
            ];

            if ( attributes.beitraege_aktivieren ) {
                sidebarElements.push(
                    el( SelectControl, {
                        label: 'Anzahl der Beiträge',
                        value: attributes.anzahl_beitraege,
                        options: [
                            { label: '3 Beiträge', value: 3 }, { label: '5 Beiträge', value: 5 },
                            { label: '10 Beiträge', value: 10 }, { label: '15 Beiträge', value: 15 },
                            { label: '20 Beiträge', value: 20 }, { label: '25 Beiträge', value: 25 },
                            { label: '30 Beiträge', value: 30 }, { label: '35 Beiträge', value: 35 },
                            { label: '40 Beiträge', value: 40 }, { label: '45 Beiträge', value: 45 },
                            { label: '50 Beiträge', value: 50 }
                        ],
                        onChange: function ( value ) { setAttributes( { anzahl_beitraege: parseInt( value, 10 ) } ); }
                    } )
                );

                sidebarElements.push(
                    el( SelectControl, {
                        label: 'Art der Überschrift',
                        value: attributes.ueberschrift_typ,
                        options: [
                            { label: 'Überschrift 2 (H2)', value: 'h2' }, { label: 'Überschrift 3 (H3)', value: 'h3' },
                            { label: 'Überschrift 4 (H4)', value: 'h4' }, { label: 'Überschrift 5 (H5)', value: 'h5' },
                            { label: 'Überschrift 6 (H6)', value: 'h6' }, { label: 'Normaler Text (P)', value: 'p' },
                            { label: 'Container (DIV)', value: 'div' }
                        ],
                        onChange: function ( value ) { setAttributes( { ueberschrift_typ: value } ); }
                    } )
                );
            }

            var categoryNames = fullCategories.map( function( cat ) { return cat.name; } ).join( ', ' );

            // Bereinigte Styles ohne feste Breite, damit das Theme-Layout greift
            var boxStyle = {
                padding: '20px',
                borderRadius: '4px',
                fontFamily: 'sans-serif',
                fontSize: '14px',
                lineHeight: '1.6',
                boxSizing: 'border-box'
            };

            var content = [];

            if ( ! attributes.beitraege_aktivieren ) {
                boxStyle.border = '2px dashed #e53e3e';
                boxStyle.background = '#fde8e8';
                boxStyle.color = '#c53030';
                content.push( el( 'strong', { key: 'status' }, '🛑 Verwandte Beiträge sind deaktiviert.' ) );
            } else if ( postData.categories.length === 0 ) {
                boxStyle.border = '2px dashed #dd6b20';
                boxStyle.background = '#fffaf0';
                boxStyle.color = '#dd6b20';
                content.push( el( 'strong', { key: 'status' }, '⚠️ Warnung: ' ), 'Dieser Beitrag hat noch keine Kategorien ausgewählt.' );
            } else {
                boxStyle.border = '2px dashed #3182ce';
                boxStyle.background = '#ebf8ff';
                boxStyle.color = '#2b6cb0';

                content.push( el( 'div', { key: 'info-1', style: { marginBottom: '8px' } }, 
                    el( 'strong', null, '📊 Live-Analyse für diesen Beitrag:' )
                ) );
                content.push( el( 'div', { key: 'info-2' }, 
                    '• Gefundene Kategorien: ', el( 'strong', null, postData.categories.length )
                ) );
                if ( categoryNames ) {
                    content.push( el( 'div', { key: 'info-3' }, 
                        '• Kategorienamen: ', el( 'span', { style: { fontStyle: 'italic' } }, categoryNames )
                    ) );
                }
                content.push( el( 'div', { key: 'info-4', style: { marginBottom: '8px' } }, 
                    '• Verfügbare verwandte Beiträge in der DB: ', el( 'strong', null, relatedPostsCount )
                ) );
                content.push( el( 'div', { key: 'info-5', style: { borderTop: '1px solid #bee3f8', paddingTop: '8px', fontSize: '12px' } }, 
                    '✓ Im Frontend werden max. ' + attributes.anzahl_beitraege + ' Einträge mit einer <' + attributes.ueberschrift_typ + '>-Überschrift angezeigt.'
                ) );

                if ( isPostDirty ) {
                    content.push( el( 'div', { 
                        key: 'info-dirty-warning', 
                        style: { 
                            marginTop: '10px', 
                            padding: '8px 12px', 
                            background: '#fff5f5', 
                            border: '1px solid #fed7d7', 
                            borderRadius: '4px', 
                            color: '#e53e3e', 
                            fontWeight: 'bold',
                            fontSize: '12px'
                        } 
                    }, 'ℹ️ Hinweis: Kategorien wurden geändert. Bitte speichere den Beitrag, damit die Live-Daten im Frontend aktiv werden!' ) );
                }
            }

            var blockProps = useBlockProps( {
                key: 'inline-preview',
                style: boxStyle
            } );

            return [
                el( InspectorControls, { key: 'inline-inspector' },
                    el( PanelBody, { title: 'Block-Einstellungen', initialOpen: true }, sidebarElements )
                ),
                el( 'div', blockProps, content )
            ];
        },
        save: function () { return null; }
    } );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components, window.wp.data );
