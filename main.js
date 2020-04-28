// Furaffinity Tags Blocker, main operations. 2020 Arctic Kona. No rights reserved.
// TODO: code cleanup

//
// Dummy blocklist
const blocklist = {
	author: [ ] ,
	title: [ "YCH" , "Reminder" ] ,
	category: [ ] ,
	subcategory: [ "Fat Furs" , "Inflation" , "Baby fur" ] ,
	species: [ ] ,
	gender: [ ] ,
	tags: [ "macro" , "obese" , "inflation" , "vore" , "feet" , "foot" , "diapered" ] ,
	description: [ ] ,
}

//
// Returns an array of for the sumbission previews of the page, with possible additional information (should be in api.js)
async function get_previews( html , path ) {
	// Use this page, or provided objects
	if ( ! html ) {
		html = window.document;
	}
	if ( ! path ) {
		path = window.location.pathname.split( "/" )[ 1 ];
	}

	// For most pages
	if ( path == "" || path == "browse" || path == "search" || path == "favorites" ) {

			// Grab submissions.
			let page = [ ];

			// Main page TODO: could optimise getting non-hidden previews first
			if ( path == "" ) {
				page.push( ... html.getElementById( "gallery-frontpage-submissions" ).getElementsByTagName( "figure" ) );
				page.push( ... html.getElementById( "gallery-frontpage-writing" ).getElementsByTagName( "figure" ) );
				page.push( ... html.getElementById( "gallery-frontpage-writing" ).getElementsByTagName( "figure" ) );
				page.push( ... html.getElementById( "gallery-frontpage-music" ).getElementsByTagName( "figure" ) );
				page.push( ... html.getElementById( "gallery-frontpage-crafts" ).getElementsByTagName( "figure" ) );

			// Browse page
			} else if ( path == "browse" ) {
				page.push( ... html.getElementById( "gallery-browse" ).getElementsByTagName( "figure" ) );

			// Search page
			} else if ( path == "search" ) {
				page.push( ... html.getElementById( "gallery-search-results" ).getElementsByTagName( "figure" ) );

			// Favorites page
			} else if ( path == "favorites" ) {
				page.push( ... html.getElementById( "gallery-favorites" ).getElementsByTagName( "figure" ) );

			}

			// Find extra information (author, title)
			let previews = [ ];
			for ( let i = 0 ; i < page.length ; i ++ ) {
				previews[ i ] = new sumbission_template( );
				previews[ i ].element = page[ i ];
				previews[ i ].link = ( new URL( page[ i ].getElementsByTagName( "a" )[ 0 ].href , "https://furaffinity.net" ) ).pathname.split( "/" )[ 2 ];
				previews[ i ].title = page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 0 ].innerHTML;
				previews[ i ].author = page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 1 ].innerHTML;
			}

			// Done
			return previews;

	// Or user page TODO: Implement
	} else if ( path == "user" ) {
		page = [
			document.getElementById( "gallery-gallery" ) ,
		];


	// Or gallery page or scraps
	} else if ( path == "gallery" || path == "scraps" ) {

			// Grab submissions.
			let page = [ ];
			page.push( ... html.getElementById( "gallery-gallery" ).getElementsByTagName( "figure" ) );

			// Find extra information (author, title)
			let previews = [ ];
			for ( let i = 0 ; i < page.length ; i ++ ) {
				previews[ i ] = new sumbission_template( );
				previews[ i ].element = page[ i ];
				previews[ i ].link = ( new URL( page[ i ].getElementsByTagName( "a" )[ 0 ].href , "https://furaffinity.net" ) ).pathname.split( "/" )[ 2 ];
				previews[ i ].title = page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 0 ].innerHTML;
				previews[ i ].author = "";	// I'm not gonna block a user on their own gallery/scraps page
			}

			// Done
			return previews;

	// Or not
	} else {
		return undefined;
	
	}
}

//
// Fixes structure issues on page.
async function trigger_page_previews( ) {

	// For some pages, somehow triggering a resize helps FIXME: (does not work yet)
	window.dispatchEvent( new Event( "resize" ) );
}

//
// Prefetching
async function prefetch_page( ) {
	let path = window.location.pathname.split( "/" )[ 1 ];

	// For the homepage, this means the browse page
	if ( path == "/" ) {
//		( await get_previews( await fetch( "/browse" , { } ) ) ).map( id => await submission_fetch_direct( id ) );

	// For the browse or search page, this means the next page
	} else if ( path == "browse" || path == "search" ) {
		if ( path == "browse" ) {
			let form = window.document.getElementById( "browse-search" ).getElementsByClassName( "section-body" )[ 0 ].getElementsByTagName( "form" )[ 1 ];
		} else if ( path == "search" ) {
			let form = window.document.getElementById( "search-form" );
		}
		let previews = await get_previews( ( new DOMParser ).parseFromString( await ( await fetch( form.action , { method : form.method , body : new URLSearchParams( new FormData( form ) ) } ) ).text( ) , "text/html" ) , path );
alert("f60b63166da05e1364a124ed972c2672");
		for ( let i = 0 ; i < previews.length ; i ++ ) {
			await submission_fetch_direct( previews[ i ].link );
		}

	}
}

//
// Checks if each preview on a page should be hidden
async function check_page_previews ( blocklist ) {

	// Get list of previews
	let previews = await get_previews( );

	// For every preview
	for ( let i = 0 ; i < previews.length ; i ++ ) {

		// See if match already with known information
		if ( ! check_submission( blocklist , previews[ i ] ) ) {
			previews[ i ].element.remove( );
			previews[ i ].display = false;

			// Trigger to fix display issues on the page
			trigger_page_previews( );
		}
	}

	for ( let i = 0 ; i < previews.length ; i ++ ) {

		// Make sure it's still around
		if ( ! previews[ i ].display ) {
			continue
		}

		// Otherwise, check for unused fields and fetch more information
		if ( Object.keys( blocklist ).some( ( key ) => blocklist[ key ].length && ( ! previews[ i ][ key ] ) ) ) {
			// Note on Furaffinity's rate limiting: 
			// Experimentally, anything more than approx. three requests per seconds, and approx. five concurrent connections, per IP address causes Furaffinity's servers to behave slowly, return 503 errors, or both.

			// With Furaffinity's response speeds, a synchronous operation seems OK to avoid a rate limit
			let submission = await submission_fetch( previews[ i ].link );
			if ( ! check_submission( blocklist , submission ) ) {
				previews[ i ].element.remove( );
				previews[ i ].display = false;

				// Trigger to fix display issues on the page
				trigger_page_previews( );
			}
		}
	}

	return true;
}

alert( "online" );

( async function ( ) {
	await check_page_previews( blocklist );
	await prefetch_page( );
	alert("done");
} )( );


