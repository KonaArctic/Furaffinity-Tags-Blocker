// Furaffinity Tags Blocker, bare-bones Furaffinity API. 2020 Arctic Kona. No rights reserved.
// TODO:
// *	Make OOP
// *	Use as background script (maybe)

//
// Empty submission template
function sumbission_template ( ) {
	this.element = null;
	this.link = 0;
	this.author = "";
	this.title = "";
	this.category = "";
	this.subcategory = "";
	this.species = "";
	this.gender = "";
	this.tags = [ ];
	this.description = "";
	this.rating = "";
	this.display = true;
}

//
// Fetch any page from Furaffinity, with basic rate limiting
var submission_fetch_furaffinity_timer = 0;
async function submission_fetch_furaffinity( path ) {

	// Limit to one request every 0.3s
	if ( Date.now( ) < submission_fetch_furaffinity_timer + 300 ) {
		// TODO: Implement
	}
	submission_fetch_furaffinity_timer = Date.now( );

	// Download file
	try{
		var response = await fetch( "https://www.furaffinity.net/" + path , {
			method: "GET",
			credentials: "include",
			referrerPolicy: "no-referrer",
		} );
	} catch( error ) {
		throw error;
	}

	// Check response, redo request if rate limited
	if ( response.status == 503 ) {
		return await submission_fetch_furaffinity( path );
	} else if ( response.status != 200 ) {
		throw new Error( "Furaffinity returned non 200 HTTP status: " + response.status );
	}

	return await response.text( )
}

//
// For submission ID, fetch from Furaffinity.
async function submission_fetch_direct( id ) {
	// Fetch
	let submission = await submission_fetch_parse( await submission_fetch_furaffinity( "/view/" + id ) );

	// And cache
	localStorage.setItem( "furaffinity-tags-blocker-cache-parsed-" + id , JSON.stringify( submission ) );	// Ugh ...

	return submission;
}

//
// Just fetch from cache instead
async function submission_fetch_cache( id ) {

	// Return parsed submission if there TODO: use browser cache API? TODO: Manage storage size
	let submission = localStorage.getItem( "furaffinity-tags-blocker-cache-parsed-" + id );
	if ( submission ) {
		return JSON.parse( submission );
	}

	// With raw HTML, parse (and cache parsed)
	submission = localStorage.getItem( "furaffinity-tags-blocker-cache-raw-" + id )
	if ( submission ) {
		submission = await fetch_submission_parse( submission );
		localStorage.setItem( "furaffinity-tags-blocker-cache-parsed-" + id , JSON.stringify( submission ) );
		localStorage.removeItem( "furaffinity-tags-blocker-cache-raw-" + id );
		return submission;

	}

	return null;
}

//
// For raw HTML, returns an object containing an array called "tags" of tags.
async function submission_fetch_parse ( submission_raw ) {
	submission_raw = ( new DOMParser ).parseFromString( submission_raw , "text/html" );

	//
	// Find requested information
	let submission = {
		category: "",
		subcategory: "",
		species: "",
		gender: "",
		tags: [
		],
		title: "",
		author: "",
		description: "",
	};

	// Info strings
	if ( submission_raw.getElementsByClassName( "info" )[ 0 ] ) {
		let info = submission_raw.getElementsByClassName( "info" )[ 0 ]
		submission.category = info.getElementsByClassName( "category-name" )[ 0 ].innerHTML;
		submission.subcategory = info.getElementsByClassName( "type-name" )[ 0 ].innerHTML;
		submission.species = info.children[ 1 ].children[ 1 ].innerHTML;
		submission.gender = info.children[ 2 ].children[ 1 ].innerHTML;
	}

	// Tags
	let tags = submission_raw.getElementsByClassName( "tags-row" )[ 0 ].children;
	for ( let i = 0 ; i < tags.length ; i ++ ) {
		submission.tags[ i ] = tags[ i ].children[ 0 ].innerHTML;
	}

	// Author, title, and description
	if ( submission_raw.getElementsByClassName( "submission-id-sub-container" )[ 0 ] ) {
		let subcontainer = submission_raw.getElementsByClassName( "submission-id-sub-container" )[ 0 ]
		submission.title = subcontainer.children[ 0 ].children[ 0 ].children[ 0 ].innerHTML;
		submission.author = subcontainer.children[ 1 ].children[ 0 ].innerHTML;
	}
	submission.description = submission_raw.getElementsByClassName( "submission-description" )[ 0 ].innerHTML;

	//
	// Return
	return submission;
}

//
// Default fetch function
async function submission_fetch ( id ) {
	let submission = await submission_fetch_cache( id );

	// Check cache
	if ( submission ) {
		return submission;

	// Or get live
	} else {
		try {
			return await submission_fetch_direct( id );
		} catch( error ) {
			alert( error );
			return undefined;
		}
	}
}


