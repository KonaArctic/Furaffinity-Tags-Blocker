//
// Kona Theme. 2020 Kona Arctic. No rights reserved. NO WARRANTY! https://akona.me mailto:arcticjieer@gmail.com

//
// Redirect to HTTPS
if ( window.location.protocol == "http:" && window.location.hostname != "localhost" ) {
//	window.location.protocol = "https:";
}

//
// Swipping for panels
// TODO:
// *	[many]

// Panel DOM
class kona_panel extends HTMLElement {
	constructor ( ) {
		super( );
		if ( ! this.tabindex ) {
			this.tabindex = "-1";
		}
	}
	on ( ) {
		this.focus( );
	}
	off ( ) {
		this.blur( );
	}
}

class kona_panel_left extends kona_panel {
	constructor ( ) { super ( ); };
}

class kona_panel_right extends kona_panel {
	constructor ( ) { super ( ); };
}

window.customElements.define( "panel-left" , kona_panel_left );
window.customElements.define( "panel-right" , kona_panel_right );

//
// Inputs: Tags
class kona_input_tags extends HTMLElement {
	constructor ( ) {
		super( );

		let check = window.document.createElement( "input-tags-check" );
		check.innerHTML = "✔";
		check.style.color = "green";
		check.style.display = "inline";
		this.appendChild( check );
	}

	append( content ) {
		content = content.trim( );
		if ( content == "" ) {
			return
		}

		for ( let item of this.getElementsByTagName( "tag" ) ) {
			if ( item.innerHTML.toLocaleLowerCase( ) == content.toLocaleLowerCase( ) ) {
				return;
			}
		}		

		let item = window.document.createElement( "tag" );
		item.innerHTML = content;
		this.appendChild( item );

		let check = window.document.createElement( "input-tags-check" );
		check.innerHTML = "✘";
		check.style.color = "red";
		check.style.display = "inline";
		check.addEventListener( "click" , ( event => this.remove( content ) ) );
		this.appendChild( check );

		this.dispatchEvent( new Event( "change" ) );
	}

	remove( content ) {
		for ( let item of this.getElementsByTagName( "tag" ) ) {
			if ( item.innerHTML.toLocaleLowerCase( ) == content.toLocaleLowerCase( ) ) {
				item.nextSibling.remove( );
				item.remove( );
			}
		}
		this.dispatchEvent( new Event( "change" ) );
	}

	get values( ) {
		let array = [ ];
		for ( let item of this.getElementsByTagName( "tag" ) ) {
			array.push( item.innerHTML );
		}
		return array;
	}

	set values( values ) {
		values.forEach( value => this.append( value ) );	// FIXME: dispateches too many onChange events
		this.dispatchEvent( new Event( "change" ) );
	}
}

class kona_input_tags_entry extends kona_input_tags {
	constructor ( ) {
		super( );

		let parent = this;
		let entry = window.document.createElement( "input" );
		entry.style.display = "inline";
		entry.addEventListener( "keyup" , function( event ) {
			if ( event.keyCode == 13 ) {
				parent.append( entry.value );
				entry.value = "";
			}
		} ); 
		this.prepend( entry );

		this.children[ 1 ].addEventListener( "click" , function( event ) {
			parent.append( entry.value );
			entry.value = "";
		} );
	}
}

class kona_input_tags_select extends kona_input_tags {
	constructor ( ) {
		super( );

		let select = window.document.createElement( "select" );
		select.style.display = "inline";
		( Array.from( this.getElementsByTagName( "optgroup" ) ) ).forEach( option => select.appendChild( option ) );
		( Array.from( this.getElementsByTagName( "option" ) ) ).forEach( option => select.appendChild( option ) );
		select.addEventListener( "input" , ( event => this.append( select.selectedOptions[ 0 ].innerHTML ) ) );
		this.prepend( select );

		this.children[ 1 ].addEventListener( "click" , ( event => this.append( select.selectedOptions[ 0 ].innerHTML ) ) );
	}
}

window.document.addEventListener( "DOMContentLoaded" , function ( event ) {
	window.customElements.define( "input-tags-entry" , kona_input_tags_entry );
	window.customElements.define( "input-tags-select" , kona_input_tags_select );
} );


