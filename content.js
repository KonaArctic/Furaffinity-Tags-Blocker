// SWFify, content script. 2020 Arctic Kona. 
// TODO:

( async function ( ) {
	//
	// Checks if each preview on a page should be hidden

	// Creates required objects
	let api = new FuraffinityAPI( );
	let profile = new FuraffinityProfile( );
	let cacheSubmission = ( await browser.storage.local.get( "cacheSubmission" ) ).cacheSubmission;
	if ( cacheSubmission ) {
		api.cacheSubmission = cacheSubmission;
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
		await browser.storage.sync.set( { "blocklist" : blocklist } ) 
	}

	// Get list of previews
	let previews = await api.getPreviews( window.document );

	// For every preview
	for ( preview of previews ) {
		// See if match already with known information
		if ( ! profile.check( preview ) ) {
			preview.destroy( );
		}
	}

	for ( preview of previews ) {

		// Make sure it's still around
		if ( ! preview.element ) {
			continue
		}

		// Otherwise, check for unused fields and fetch more information
		if ( Object.keys( profile.blocklist ).some( function( key ) {
				return profile.blocklist[ key ].length && ( ! preview[ key ] ) ? 1 : -1;	// Compact version does not work on Chrome https://www.freecodecamp.org/forum/t/the-sort-method-behaves-different-on-different-browsers/237221
			} ) ) {

			// With Furaffinity's response speeds, a synchronous operation seems OK to avoid a rate limit
			let submission = await api.getSubmission( preview );
			if ( ! profile.check( submission ) ) {
				preview.destroy( );
			}

			// FIXME: this might be a bad way to operate caching
			browser.storage.local.set( { "cacheSubmission": api.cacheSubmission } );
		}
	}

	//
	// Then do prefetching
	if ( ( await browser.storage.sync.get( "settings" ) ).settings.prefetch ) { 
		let prefetches = await api.getPrefetch( window.document );
		prefetches = await api.getPreviews( prefetches );
		for ( prefetch of prefetches ) {
			await api.getSubmission( prefetch );
			await browser.storage.local.set( { "cacheSubmission": api.cacheSubmission } );
		}	
	}
} )( );


