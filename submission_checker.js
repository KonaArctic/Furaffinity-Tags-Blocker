// Furaffinity Tags Blocker, main. 2020 Arctic Kona. No rights reserved.

//
// Given a blocklist and submission data, returns false to block submission or true to allow. This is the function default.
async function submission_check( blocklist , submission ) {
	// Check info
	if ( blocklist.category.includes( submission.category ) ||
		blocklist.subcategory.includes( submission.subcategory ) ||
		blocklist.species.includes( submission.species ) ||
		blocklist.gender.includes( submission.gender ) ) {
			return false;
	}

	// Checks tags
	for ( let i = 0 ; i < submission.tags.length ; i ++ ) {
		if ( blocklist.tags.map( v => v.toLowerCase( ) ).includes( submission.tags[ i ].toLowerCase( ) ) ) {
			return false;
		}
	}

	// Check author
	if ( blocklist.author.includes( submission.author ) ) {
		return false;
	}
	
	// Title
	for ( let i = 0 ; i < blocklist.title.length ; i ++ ) {
		if ( submission.title.match( new RegExp( "\\b" + blocklist.title[ i ] + "\\b" , "i" ) ) ) {
			return false
		}
	}
	
	// And description
	for ( let i = 0 ; i < blocklist.description.length ; i ++ ) {
		if ( submission.description.match( new RegExp( "\\b" + blocklist.description[ i ] + "\\b" , "i" ) ) ) {
			return false
		}
	}

	// Okie~! Clean!
	return true;
}


