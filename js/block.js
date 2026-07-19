( function ( blocks, element, blockEditor, components ) {
    var el = element.createElement;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var ToggleControl = components.ToggleControl;
    var SelectControl = components.SelectControl;

    blocks.registerBlockType( 'fambach/related-posts', {
        edit: function ( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            // Container für die Sidebar-Elemente vorbereiten
            var sidebarElements = [
                el( ToggleControl, {
                    label: 'Verwandte Beiträge aktivieren',
                    checked: attributes.beitraege_aktivieren,
                    onChange: function ( value ) {
                        setAttributes( { beitraege_aktivieren: value } );
                    },
                } )
            ];

            // Bedingte Logik: Auswahlliste nur anzeigen, wenn Schalter AKTIV ist
            if ( attributes.beitraege_aktivieren ) {
                sidebarElements.push(
                    el( SelectControl, {
                        label: 'Anzahl der Beiträge',
                        value: attributes.anzahl_beitraege,
                        options: [
                            { label: '3 Beiträge', value: 3 },
                            { label: '5 Beiträge', value: 5 },
                            { label: '10 Beiträge', value: 10 },
                            { label: '15 Beiträge', value: 15 },
                            { label: '20 Beiträge', value: 20 }
                        ],
                        onChange: function ( value ) {
                            // Wichtig: Wert aus dem Dropdown in eine echte Ganzzahl konvertieren
                            setAttributes( { anzahl_beitraege: parseInt( value, 10 ) } );
                        },
                    } )
                );
            }

            // Rückgabe für das Editor-Backend
            return [
                el( InspectorControls, { key: 'setting' },
                    el( PanelBody, { title: 'Block-Einstellungen', initialOpen: true },
                        sidebarElements
                    )
                ),
                el( 'div', { className: props.className + ' related-posts-admin-preview' }, 
                    attributes.beitraege_aktivieren 
                        ? '✓ Verwandte Beiträge aktiv (Vorschau zeigt max. ' + attributes.anzahl_beitraege + ' Beiträge im Frontend).'
                        : '🛑 Verwandte Beiträge sind deaktiviert.'
                )
            ];
        },
        save: function () {
            // Da es ein dynamischer Block ist, wird das HTML komplett in PHP gerendert
            return null;
        },
    } );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components );
