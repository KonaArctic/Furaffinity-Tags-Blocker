// Furaffinity Tags Blocker, main. 2020 Arctic Kona. No rights reserved.

//
// Example blocklist
const blocklist = {
	author: [ ] ,
	title: [ ] ,
	category: [ ] ,
	subcategory: [ ] ,
	species: [ ] ,
	gender: [ ] ,
	tags: [ ] ,
	description: [ ] ,
}

//
// Returns an array of for the sumbissions of the page, with possible additional information
async function get_page_submissions( blocklist ) {

	// For front page
	if ( window.location.pathname == "/" ) {
	
			// Grab submissions.
			let page = ( [ ] );
			page.push( ...document.getElementById( "gallery-frontpage-submissions" ).getElementsByTagName( "figure" ) );
			page.push( ...document.getElementById( "gallery-frontpage-writing" ).getElementsByTagName( "figure" ) );
			page.push( ...document.getElementById( "gallery-frontpage-writing" ).getElementsByTagName( "figure" ) );
			page.push( ...document.getElementById( "gallery-frontpage-music" ).getElementsByTagName( "figure" ) );
			page.push( ...document.getElementById( "gallery-frontpage-crafts" ).getElementsByTagName( "figure" ) );

			// If blocklist only includes author and title, then no need to fetch extra information
			if ( blocklist.category.length + blocklist.subcategory.length + blocklist.species.length + blocklist.gender.length + blocklist.tags.length + blocklist.description.length == 0 ) {
				for ( let i = 0 ; i < page.length ; i ++ ) {
					alert( page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 1 ].innerHTML );
					await submission_check( blocklist , {
						"title": page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 0 ].innerHTML,
						"author": page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 1 ].innerHTML,
					} );
				}

			// Otherwise, we'll have to fetch it
			} else {

			}

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

check_page( blocklist );


