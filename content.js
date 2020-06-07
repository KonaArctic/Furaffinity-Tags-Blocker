// SWFify, content script. 2020 Arctic Kona. 
// TODO: fix caching issues

( async function ( ) {
	//
	// Creates required objects

	let api = new FuraffinityAPI( );
	let profile = new FuraffinityProfile( );
	let cacheSubmission = ( await browser.storage.local.get( "cacheSubmission" ) ).cacheSubmission;
	if ( cacheSubmission ) {
		api.cacheSubmission = cacheSubmission;
	}

	let settings = ( await browser.storage.sync.get( "settings" ) ).settings;
	if ( ! settings ) {
		settings = { };
		settings.master = true;
		settings.caching = true;
		settings.prefetch = true;
		settings.tags = false;
		browser.storage.sync.set( { "settings" : settings } ) 
	}

	let blocklist = ( await browser.storage.sync.get( "blocklist" ) ).blocklist;
	if ( blocklist ) {
		profile.blocklist = blocklist;
	} else {
		// Here's a basic blocklist
		blocklist = profile.blocklist;
		blocklist.subcategory = [ "Fat Furs" , "Paws" ];
		blocklist.tags = [ "vore" , "feet" , "diaper" , "diapers" ];
		blocklist.title = [ "feet" , "diaper" ];
		browser.storage.sync.set( { "blocklist" : blocklist } ) 
	}

	// Get list of previews
	let previews = await api.getPreviews( window.document );

	// Can I proccess this page?
	if ( ! previews ) {
		return;
	}

	// Terminate if turned off
	if ( ! settings.master ) {
		for ( let preview of previews ) {
			preview.recover( );
		}
		return;
	}

	// Save at quit
	window.addEventListener( "beforeunload", function( event ) {
		// Cannot save HTML elements and methods FIXME: already implemented in interface.js
		for ( let key of Object.keys( api.cacheSubmission ) ) {
			api.cacheSubmission[ key ].element = null;
			api.cacheSubmission[ key ].destroy = null;
			api.cacheSubmission[ key ].restore = null;
		}
		browser.storage.local.set( { "cacheSubmission": api.cacheSubmission } );
	} );

	//
	// Discard unused cache
	if ( ! settings.caching ) {
		let cache = { };
		for ( preview of previews ) {
			cache[ preview.number ] = api.cacheSubmission[ preview.number ];
		}
		api.cacheSubmission = cache;
	}

	//
	// Checks if each preview on a page should be hidden

	// See if match already with known information
	for ( let preview of previews ) {
		if ( ! profile.check( preview ) ) {
			preview.destroy( );
		}
	}

	// Or fetch more information
	for ( let preview of previews ) {

		// Make sure it's still around
		if ( preview.hidden ) {
			continue
		}

		// Otherwise, check for unused fields and fetch more information
		if ( Object.keys( profile.blocklist ).some( function( key ) {
				return profile.blocklist[ key ].length && ( ! preview[ key ] ) ? 1 : -1;	// Compact version does not work on Chrome https://www.freecodecamp.org/forum/t/the-sort-method-behaves-different-on-different-browsers/237221
			} ) ) {

			// With Furaffinity's response speeds, a synchronous operation seems OK to avoid a rate limit
			let submission = await api.getSubmission( preview );

			// Check if I should block
			if ( settings.tags && ( ! submission.permission || submission.tags.length == 0 ) ) {
				preview.destroy( );
			} else if ( ! profile.check( submission ) ) {
				preview.destroy( );
			}
		}
	}

	//
	// Then do prefetching
	if ( settings.prefetch ) { 
		let prefetches = await api.getPrefetch( window.document );
		prefetches = await api.getPreviews( prefetches );
		for ( prefetch of prefetches ) {
			await api.getSubmission( prefetch );
		}	
	}

} )( );


