// Furaffinity Tags Blocker, bare-bones Furaffinity API. 2020 Kona Arctic. Contacts: mailto:arcticjieer@gmail.com https://akona.me/. Copyright: https://license.akona.me/. NO WARRANTY!
// TODO:
// *	Use as background script (maybe)

class FuraffinityAPI {
	constructor( ) {
		/* In seconds since epoch a HTTP request to Furaffinity was made */
		this.lastRequestTime = 0;

		/* Caches goes here */
		this.cacheSubmission = { };
	}

	//
	// Gets any page from Furaffinity, honouring rate limits.
	async getPage( request ) {

		// Note on Furaffinity's rate limiting: 
		// Experimentally, anything more than approx. three requests per seconds, and approx. five concurrent connections, per IP address causes Furaffinity's servers to behave slowly, return 503 errors, or both.
		// Limit to one request every 0.3s
		while ( Date.now( ) < this.lastRequestTime + 300 ) {
			await new Promise( resolve => setTimeout( resolve , 300 - ( Date.now( ) - this.lastRequestTime ) ) );
		}
		this.lastRequestTime = Date.now( );

		// If it's a path, convert to request object
		if ( typeof( request ) == typeof( "string" ) || typeof( request ) == typeof( 1234 ) ) {
			request = new Request( "https://www.furaffinity.net/" + request , {
				method: "GET",
				credentials: "include",
				referrerPolicy: "no-referrer",
			} );
		}

		// Download
		let response = null;
		try {
			response = await fetch( request );
		} catch( error ) {
			throw error;
		}

		// Check response, redo request if rate limited
		if ( response.status == 503 ) {
			return await this.getPage( request );
		} else if ( response.status != 200 ) {
			throw new Error( "Furaffinity returned HTTP status: " + response.status );
		}

		// Okie~
		return ( new DOMParser ).parseFromString( await response.text( ) , "text/html" );
	}

	//
	// Gets information about all previews on a page
	async getPreviews( request ) {

		// Fetch if not HTML element
		let html = null;
		if ( request.getElementById ) {
			html = request;
		} else {
			html = await this.getPage( request );
		}

		// Does it look like most pages?
		if ( html.getElementById( "gallery-frontpage-submissions" ) || html.getElementById( "gallery-browse" ) || html.getElementById( "gallery-search-results" ) || html.getElementById( "gallery-favorites" ) ) {

				// Grab submissions.
				let page = [ ];

				// Main page TODO: could optimise getting non-hidden previews first
				if ( html.getElementById( "gallery-frontpage-submissions" ) ) {
					page.push( ... html.getElementById( "gallery-frontpage-submissions" ).getElementsByTagName( "figure" ) );
					page.push( ... html.getElementById( "gallery-frontpage-writing" ).getElementsByTagName( "figure" ) );
					page.push( ... html.getElementById( "gallery-frontpage-writing" ).getElementsByTagName( "figure" ) );
					page.push( ... html.getElementById( "gallery-frontpage-music" ).getElementsByTagName( "figure" ) );
					page.push( ... html.getElementById( "gallery-frontpage-crafts" ).getElementsByTagName( "figure" ) );

				// Browse page
				} else if ( html.getElementById( "gallery-browse" ) ) {
					page.push( ... html.getElementById( "gallery-browse" ).getElementsByTagName( "figure" ) );

				// Search page
				} else if ( html.getElementById( "gallery-search-results" ) ) {
					page.push( ... html.getElementById( "gallery-search-results" ).getElementsByTagName( "figure" ) );

				// Favorites page
				} else if ( html.getElementById( "gallery-favorites" ) ) {
					page.push( ... html.getElementById( "gallery-favorites" ).getElementsByTagName( "figure" ) );

				}

				// Find extra information (author, title)
				let previews = [ ];
				for ( let i = 0 ; i < page.length ; i ++ ) {
					previews[ i ] = new FuraffinityAPI.Submission( );
					previews[ i ].element = page[ i ];
					previews[ i ].number = ( new URL( page[ i ].getElementsByTagName( "a" )[ 0 ].href , "https://furaffinity.net" ) ).pathname.split( "/" )[ 2 ];
					previews[ i ].title = page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 0 ].innerHTML;
					previews[ i ].author = page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 1 ].innerHTML;
				}

				// Done
				return previews;

		// Or user page TODO: Implement
		} else if ( "false" == "user" ) {
			page = [
				document.getElementById( "gallery-gallery" ) ,
			];


		// Or gallery page or scraps
		} else if ( html.getElementById( "gallery-gallery" ) ) {

				// Grab submissions.
				let page = [ ];
				page.push( ... html.getElementById( "gallery-gallery" ).getElementsByTagName( "figure" ) );

				// Find extra information (author, title)
				let previews = [ ];
				for ( let i = 0 ; i < page.length ; i ++ ) {
					previews[ i ] = new FuraffinityAPI.Submission( );
					previews[ i ].element = page[ i ];
					previews[ i ].number = ( new URL( page[ i ].getElementsByTagName( "a" )[ 0 ].href , "https://furaffinity.net" ) ).pathname.split( "/" )[ 2 ];
					previews[ i ].title = page[ i ].getElementsByTagName( "figcaption" )[ 0 ].getElementsByTagName( "a" )[ 0 ].innerHTML;
					previews[ i ].author = "";	// I'm not gonna block a user on their own gallery/scraps page
				}

				// Done
				return previews;

		// Or not
		} else {
			return null;

		}
	}

	//
	// Gets information about a submission
	async getSubmission( request ) {

		let response = null;
		let submission = new FuraffinityAPI.Submission( );


		// Is the request a HTML element?
		if ( request.getElementsByClassName ) {
			response = request;

		// Maybe a submission object?
		} else if ( request.number ) {
			// Cache?
			if ( this.cacheSubmission[ "" + request.number ] ) {
				return this.cacheSubmission[ "" + request.number ];
			}

			submission = request;
			response = await this.getPage( "/view/" + request.number );

		// Or another object?
		} else if ( typeof( request ) == typeof( { } ) ) {
			response = await this.getPage( request );

		// Just a number?
		} else {
			// Cache?
			if ( this.cacheSubmission[ "" + request ] ) {
				return this.cacheSubmission[ "" + request ];
			}

			response = await this.getPage( "/view/" + request );
		}

		// Info strings
		let info = response.getElementsByClassName( "info" )[ 0 ]
		if ( info ) {
			submission.category = info.getElementsByClassName( "category-name" )[ 0 ].innerHTML;
			submission.subcategory = info.getElementsByClassName( "type-name" )[ 0 ].innerHTML;
			submission.species = info.children[ 1 ].children[ 1 ].innerHTML;
			submission.gender = info.children[ 2 ].children[ 1 ].innerHTML;
		}

		// Tags
		let tags = response.getElementsByClassName( "tags-row" )[ 0 ];
		if ( tags ) {
			for ( let i = 0 ; i < tags.children.length ; i ++ ) {
				submission.tags[ i ] = tags.children[ i ].children[ 0 ].innerHTML;
			}
		}

		// Author, title, and description
		let subcontainer = response.getElementsByClassName( "submission-id-sub-container" )[ 0 ];
		if ( subcontainer ) {
			submission.title = subcontainer.children[ 0 ].children[ 0 ].children[ 0 ].innerHTML;
			submission.author = subcontainer.children[ 1 ].children[ 0 ].innerHTML;
		}
		let description = response.getElementsByClassName( "submission-description" )[ 0 ];
		if ( description ) {
			submission.description = description;
		}

		// Also, store in cache if possible
		if ( request.number ) {
			this.cacheSubmission[ "" + request.number ] = submission;
		} else if ( typeof( request ) == typeof( "string" ) || typeof( request ) == typeof( 1234 ) ) {
			this.cacheSubmission[ "" + request ] = submission;
		}

		return submission;
	}

	//
	// Prefetch returns only returns a request object for getPreviews
	async getPrefetch( request ) {

		// copypasta ...
		let html = null;
		if ( request.getElementById ) {
			html = request;
		} else {
			html = await this.getPage( request );
		}

		// This means the next page
		let form = null;
		let body = null;
		
		// For the search form,
		if ( html.getElementById( "search-form" ) ) {
			form = html.getElementById( "search-form" );
			body = new URLSearchParams( new FormData( form ) );
			let page = html.getElementsByClassName( "pagination" )[ 0 ].children[ 1 ].innerText.split( "#" )[ 1 ];
			page = window.parseInt( page );
			body.set( "page" , page + 1 );

		// browse page,
		} else if ( html.getElementsByClassName( "browse-content" ) ) {
			form = html.getElementsByClassName( "browse-content" )[ 0 ].getElementsByClassName( "navigation" )[ 0 ].children[ 2 ].children[ 0 ];
			body = new URLSearchParams( new FormData( form ) );

		// gallery,
		} else if ( html.getElementsByClassName( "submission-list" ) ) {
			form = html.getElementsByClassName( "submission-list" )[ 0 ].children[ 0 ].children[ 2 ].getElementsByTagName( "form" )[ 0 ];
			body = "";

		// or favorites
		} else if ( html.getElementById( "gallery-favorites" ) ) {
			let href = window.document.getElementsByClassName( "pagination" )[ 0 ].getElementsByClassName( "right" )[ 0 ].href;
			return new Request( href , { credentials: "include" , referrerPolicy: "no-referrer" } );	

		// None of the above
		} else {
			return null;
		}

		// Return object
		return new Request( form.action , {
			method: form.method,
			credentials: "include",
			referrerPolicy: "no-referrer",
			body: body,
		} );
	}
}

//
// Boilerplate submission object
FuraffinityAPI.Submission = class {
	constructor( ) {
		this.element = null;
		this.number = 1;
		this.thumbnail = null;
		this.link = null;
		this.author = null;
		this.title = null;
		this.category = null;
		this.subcategory = null;
		this.species = null;
		this.gender = null;
		this.tags = [ ];
		this.description = null;
		this.rating = null;
	}

	destroy( ) {
		if ( this.element ) {
			this.element.remove( );

			// For some pages, somehow triggering a resize helps
			window.dispatchEvent( new Event( "resize" ) );
		}
	}
}

