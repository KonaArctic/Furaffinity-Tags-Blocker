// Furaffinity Tags Blocker, main operations. 2020 Arctic Kona. No rights reserved.

//
// Dummy blocklist
const blocklist = {
	author: [ ] ,
	title: [ "YCH" , "Reminder" ] ,
	category: [ ] ,
	subcategory: [ ] ,
	species: [ ] ,
	gender: [ ] ,
	tags: [ ] ,
	description: [ ] ,
}

//
// Returns an array of for the sumbissions of the page, with possible additional information
async function get_previews( ) {

	// For front page
	if ( window.location.pathname == "/" ) {

			// Grab submissions.
			let page = [ ];
			page.push( ... document.getElementById( "gallery-frontpage-submissions" ).getElementsByTagName( "figure" ) );
			page.push( ... document.getElementById( "gallery-frontpage-writing" ).getElementsByTagName( "figure" ) );
			page.push( ... document.getElementById( "gallery-frontpage-writing" ).getElementsByTagName( "figure" ) );
			page.push( ... document.getElementById( "gallery-frontpage-music" ).getElementsByTagName( "figure" ) );
			page.push( ... document.getElementById( "gallery-frontpage-crafts" ).getElementsByTagName( "figure" ) );

			// Grab extra information
			let submissions = [ ];
			for ( let i = 0 ; i < page.length ; i ++ ) {
				submissions.push( {
					element: page[ i ],
					link: ( new URL( page[ i ].getElementsByTagName( "a" )[ 0 ].href , "https://furaffinity.net" ) ).pathname.split( "/" )[ 2 ],
					title: page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 0 ].innerHTML,
					author: page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 1 ].innerHTML,
				} );
			}

			// Done
			return submissions;

	// Or browse page
	} else if ( window.location.pathname.split( "/" )[ 1 ] == "browse" ) {
		page = [
			document.getElementById( "gallery-browse" ) ,
		];

	// Or search page
	} else if ( window.location.pathname.split( "/" )[ 1 ] == "search" ) {
		page = [
			document.getElementById( "gallery-search-results" ) ,
		];

	// Or user page
	} else if ( window.location.pathname.split( "/" )[ 1 ] == "search" ) {
		page = [
			document.getElementById( "gallery-search-results" ) ,
		];

	// Or gallery page
	} else if ( window.location.pathname.split( "/" )[ 1 ] == "gallery" ) {
		page = [
			document.getElementById( "gallery-gallery" ) ,
		];

	// Or scraps page
	} else if ( window.location.pathname.split( "/" )[ 1 ] == "scraps" ) {
		page = [
			document.getElementById( "gallery-gallery" ) ,
		];

	// Or favorites page
	} else if ( window.location.pathname.split( "/" )[ 1 ] == "favorites" ) {
		page = [
			document.getElementById( "gallery-favorites" ) ,
		];

	// Or not
	} else {
		return 0
	
	}
}

//
// Fixes structure issues on page. Currently -only for frontpage- does not work
async function trigger_page_previews( ) {

	// For front page
	if ( window.location.pathname == "/" ) {
		document.dispatchEvent( new Event( "resize" ) );
	}
}

//
// Checks if each preview on a page should be hidden
async function check_page_previews ( blocklist ) {
	// Empty template
	const template = {
		author: "" ,
		title: "" ,
		category: "" ,
		subcategory: "" ,
		species: "" ,
		gender: "" ,
		tags: [ ] ,
		description: "" ,
	}


	// Get list of previews
	let previews = await get_previews( );
	
	//FIXME: refactor

	// If every field of blocklist is already informed by previews, then we do not need to fetch more information
	if ( ! Object.keys( blocklist ).some( ( key ) => blocklist[ key ].length && ( ! previews[ 0 ][ key ] ) ) ) {
		for ( let i = 0 ; i < previews.length ; i ++ ) {
			let submission = template;
			Object.keys( template ).map( ( key ) => previews[ i ][ key ] && ( submission[ key ] = previews[ i ][ key ] ) );
			if ( ! check_submission( blocklist , submission ) ) {
				previews[ i ].element.remove( );
			}
		}

	// Otherwise, we'll have to fetch it
	} else {
		for ( let i = 0 ; i < previews.length ; i ++ ) {
			( async function ( ) {
				let submission = await fetch_submission( previews[ i ].link );
				if ( ! check_submission( blocklist , submission ) ) {
					previews[ i ].element.remove( );
				}
			} )( );
		}

	}

	// Trigger to fix display issues on the page
	trigger_page_previews( );

	return true;
}

//alert( "online" )

check_page_previews( blocklist );


