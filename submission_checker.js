// Furaffinity Tags Blocker, default function to check submissions. 2020 Arctic Kona. No rights reserved.

//
// Given a blocklist and submission data, returns false to block submission or true to allow. This is the function default. FIXME: case sensitive
function check_submission( blocklist , submission ) {

	// Check info
	if ( blocklist.category.includes( submission.category ) ||
		blocklist.subcategory.includes( submission.subcategory ) ||
		blocklist.species.includes( submission.species ) ||
		blocklist.gender.includes( submission.gender ) ) {
			return false;
	}

	// Checks tags
	if ( submission.tags.map( tag => tag.toLowerCase( ) ).some( tag => blocklist.tags.map( tag => tag.toLowerCase( ) ).includes( tag ) ) ) {
		return false;
	}

	// Check author
	if ( blocklist.author.includes( submission.author ) ) {
		return false;
	}
	
	// Title
	if ( blocklist.title.some( title => submission.title.match( new RegExp( "\\b" + title + "\\b" , "i" ) ) ) ) {
		return false;
	}
	
	// And description
	if ( blocklist.description.some( description => submission.description.match( new RegExp( "\\b" + description + "\\b" , "i" ) ) ) ) {
		return false;
	}

	// Okie~! Clean!
	return true;
}


