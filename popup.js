window.document.addEventListener( "DOMContentLoaded" , function ( event ) {
	( async function( ) {

		// Grab existing settings
		let settings = ( await browser.storage.sync.get( "settings" ) ).settings;
		settings.update = function( ) {
			browser.storage.sync.set( {
				"settings": {
					master: this.master,
					prefetch: this.prefetch,
					caching: this.caching,
					tags: this.tags,
				}
			} );
			browser.tabs.executeScript( { file: "/content.js" } ); 
		}

		let blocklist = ( await browser.storage.sync.get( "blocklist" ) ).blocklist;
		window.document.getElementById( "category" ).values = blocklist.category;
		window.document.getElementById( "type" ).values = blocklist.subcategory;
		window.document.getElementById( "tags" ).values = blocklist.tags;
		window.document.getElementById( "title" ).values = blocklist.title;
		window.document.getElementById( "description" ).values = blocklist.description;

		// Run updates of settings
		let elements = [ ];
		elements.push( ... window.document.getElementsByTagName( "input-tags-select" ) );
		elements.push( ... window.document.getElementsByTagName( "input-tags-entry" ) );
		for ( let i = 0 ; i < elements.length ; i ++ ) {	// FIXME
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
				browser.tabs.executeScript( { file: "/content.js" } ); 
			} );
		}

		// Toggle master switch (I write too much messy code)
		let master = window.document.getElementById( "masterswitch" );
		master_set = function( bool ) {
			if ( ! bool ) {
				window.document.getElementById( "masterswitch-image" ).style.filter = "grayscale( 100% )";
				window.document.getElementById( "masterswitch-text" ).innerHTML = "filter disabled";
				settings.master = false;
				settings.update( );
			} else {
				window.document.getElementById( "masterswitch-image" ).style.filter = "grayscale( 0% )";
				window.document.getElementById( "masterswitch-text" ).innerHTML = "filter enabled";
				settings.master = true;
				settings.update( );
			}
		}
		master.addEventListener( "click" , function( event ) {
			master_set( ! settings.master )
		} );
		master_set( settings.master )

		// Prefetch option
		let prefetch = window.document.getElementById( "prefetch" );
		prefetch.addEventListener( "click" , function( event ) {
			settings.prefetch = prefetch.checked
			settings.update( );
		} );
		prefetch.checked = settings.prefetch;

		// Tag option
		let tagsrequired = window.document.getElementById( "tagsrequired" );
		tagsrequired.addEventListener( "click" , function( event ) {
			settings.tags = tagsrequired.checked
			settings.update( );
		} );
		tagsrequired.checked = settings.tags;

		// Don't forget caching UI
		if ( settings.caching ) {
			let cachesize = window.document.getElementById( "cachesize" )
			if ( browser.storage.local.getBytesInUse ) {
				cachesize.innerHTML = ( await browser.storage.local.getBytesInUse( "cacheSubmission" ) / 1000 / 1000 ).toFixed( 2 );
			} else {
				cachesize.innerHTML = ( JSON.stringify( await browser.storage.local.get( "cacheSubmission" ) ).length / 1000 / 1000 ).toFixed( 2 );
			}
		} else {
			cachesize.innerHTML = "0.00";
		}
		let caching = window.document.getElementById( "caching" );
		caching.addEventListener( "click" , function( event ) {
			cachesize.innerHTML = "0.00";
			settings.caching = caching.checked;
			settings.update( );
		} );
		caching.checked = settings.caching;

		// Check updates (Chrome only)
		try {
			let update = await fetch( "https://cors.akona.me/https://sfwify.akona.me/chrome-update" );
			update = await update.text( );
			if ( update > 0 ) {
				window.document.getElementById( "update" ).style.display = "block";
			}
		} catch( error ) {

		}
	} )( );
} );


