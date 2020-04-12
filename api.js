// Furaffinity Tags Blocker, bare-bones Furaffinity API. 2020 Arctic Kona. No rights reserved.

//
// CORS proxy
const cors_proxy = "https://akona.me/#media/35126810#https://cors.akona.me/corsproxy/?apiurl="

//
// For submission ID, returns an object containing an array called "tags" of tags.
async function fetch_submission( submission_id ) {
	//
	// Download file, and parse plain HTML into DOM
	var submission_raw = await fetch( cors_proxy + "https://furaffinity.net/view/" + submission_id , {
		method: "GET",
		mode: "cors",
		credentials: "include",
		referrerPolicy: "no-referrer",
	});
	if ( submission_raw.status != 200 ) {
		return null; }
	submission_raw = ( new DOMParser ).parseFromString( await submission_raw.text( ) , "text/html" );

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
	if ( let info = submission_raw.getElementsByClassName( "info" )[ 0 ] ) {
		submission.category = info.getElementsByClassName( "category-name" )[ 0 ].innerHTML;
		submission.subcategory = info.getElementsByClassName( "type-name" )[ 0 ].innerHTML;
		submission.species = info.children[ 1 ].children[ 0 ].innerHTML;
		submission.gender = info.children[ 2 ].children[ 0 ].innerHTML;
	}

	// Tags
	let tags = submission_raw.getElementsByClassName( "tags-row" )[ 0 ].children;
	for ( let i = 0 ; i < tags.length ; i ++ ) {
		submission.tags[ i ] = tags[ i ].children[ 0 ].innerHTML;
	}

	// Author, title, and description
	if ( let subcontainer = submission_raw.getElementsByClassName( "submission-id-sub-container" )[ 0 ] ) {
		submission.title = subcontainer.children[ 0 ].children[ 0 ].children[ 0 ].innerHTML;
		submission.author = subcontainer.children[ 1 ].children[ 0 ].innerHTML;
	}
	submission.description = submission_raw.getElementsByClassName( "submission-description" )[ 0 ].innerHTML;

	//
	// Return
	return submission;
}


