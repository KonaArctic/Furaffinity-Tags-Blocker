window.document.addEventListener( "DOMContentLoaded" , function ( event ) {
	( async function( ) {
		// Grab existing settings
		let settings = ( await browser.storage.sync.get( "settings" ) ).settings;
		if ( settings ) {
			window.document.getElementById( "prefetch" ).checked = settings.prefetch;
		}
		let blocklist = ( await browser.storage.sync.get( "blocklist" ) ).blocklist;
		if ( blocklist ) {
			window.document.getElementById( "category" ).values = blocklist.category;
			window.document.getElementById( "type" ).values = blocklist.subcategory;
			window.document.getElementById( "tags" ).values = blocklist.tags;
			window.document.getElementById( "title" ).values = blocklist.title;
			window.document.getElementById( "description" ).values = blocklist.description;
		}

		// Run updates of settings
		let elements = window.document.getElementsByTagName( "*" );
		for ( let i = 0 ; i < elements.length ; i ++ ) {
			elements[ i ].addEventListener( "change" , function( event ) {
				browser.storage.sync.set( { "blocklist": {
					category: window.document.getElementById( "category" ).values,
					subcategory: window.document.getElementById( "type" ).values,
					tags: window.document.getElementById( "tags" ).values,
					title: window.document.getElementById( "title" ).values,
					description: window.document.getElementById( "description" ).values,
					author: [ ],
					species: [ ],
					gender: [ ],
				} } );
				browser.storage.sync.set( {
					"settings": {
						prefetch: window.document.getElementById( "prefetch" ).checked,
					}
				} );
			} );
		}

		// Don't forget caching UI
		let cachesize = window.document.getElementById( "cachesize" )
		cachesize.innerHTML = ( await browser.storage.local.getBytesInUse( "cacheSubmission" ) / 1000 / 1000 ).toFixed( 2 );
		window.document.getElementById( "caching" ).addEventListener( "click" , function( event ) {
			browser.storage.local.set( { "cacheSubmission": { } } );
			cachesize.innerHTML = "0.00";
		} );
	} )( );
} );


