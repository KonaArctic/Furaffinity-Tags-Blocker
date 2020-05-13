// Furaffinity Tags Blocker, default function to check submissions. 2020 Kona Arctic. Contacts: mailto:arcticjieer@gmail.com https://akona.me/. Copyright: https://license.akona.me/. NO WARRANTY!

class FuraffinityProfile {
	constructor( ) { }

	//
	// Testing blocklist
	blocklist = {
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
	// Given a blocklist and submission data, returns false to block submission or true to allow. This is the function default. FIXME: case sensitive
	check( submission ) {

		// Check info
		if ( this.blocklist.category.includes( submission.category ) ||
			this.blocklist.subcategory.includes( submission.subcategory ) ||
			this.blocklist.species.includes( submission.species ) ||
			this.blocklist.gender.includes( submission.gender ) ) {
				return false;
		}

		// Checks tags
		if ( submission.tags.map( tag => tag.toLowerCase( ) ).some( tag => this.blocklist.tags.map( tag => tag.toLowerCase( ) ).includes( tag ) ) ) {
			return false;
		}

		// Check author
		if ( this.blocklist.author.includes( submission.author ) ) {
			return false;
		}
		
		// Title
		if ( this.blocklist.title.some( title => submission.title.match( new RegExp( "\\b" + title + "\\b" , "i" ) ) ) ) {
			return false;
		}
		
		// And description
		if ( this.blocklist.description.some( description => submission.description.match( new RegExp( "\\b" + description + "\\b" , "i" ) ) ) ) {
			return false;
		}

		// Okie~! Clean!
		return true;
	}
}

