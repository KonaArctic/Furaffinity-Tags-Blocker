//
// Kona Theme. 2020 Kona Arctic. No rights reserved. NO WARRANTY! https://akona.me mailto:arcticjieer@gmail.com

//
// Redirect to HTTPS
if ( window.location.protocol == "http:" && window.location.hostname != "localhost" ) {
	window.location.protocol = "https:";
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
	}

	append ( content ) {
		if ( content == "" ) {
			return
		}
		this.remove( content );

		let item = window.document.createElement( "input-tags-tag" );
		item.innerHTML = content;
		this.appendChild( item );

		let check = window.document.createElement( "input-tags-check" );
		check.innerHTML = "✘";
		check.style.color = "red";
		check.style.display = "inline";
		check.addEventListener( "click" , ( event => this.remove( content ) ) );
		this.appendChild( check );
	}

	remove ( content ) {
		for ( let item of this.getElementsByTagName( "input-tags-tag" ) ) {
			if ( item.innerHTML.toLocaleLowerCase( ) == content.toLocaleLowerCase( ) ) {
				item.nextSibling.remove( );
				item.remove( );
			}
		}
	}

	get values ( ) {
		let array = [ ];
		for ( let item of this.getElementsByTagName( "input-tags-tag" ) ) {
			array.push( item.innerHTML );
		}
		return array;
	}
}

class kona_input_tags_entry extends kona_input_tags {
	constructor ( ) {
		super( );

		let entry = window.document.createElement( "input" );
		entry.style.display = "inline";
		entry.addEventListener( "keyup" , ( event => ( event.keyCode == 13 ) && this.append( entry.value ) ) ); 
		this.appendChild( entry );

		let check = window.document.createElement( "input-tags-check" );
		check.innerHTML = "✔";
		check.style.color = "green";
		check.style.display = "inline";
		check.addEventListener( "click" , ( event => this.append( entry.value ) ) );
		this.appendChild( check );
	}
}

class kona_input_tags_select extends kona_input_tags {
	constructor ( ) {
		super( );

		let select = window.document.createElement( "select" );
		select.style.display = "inline";
		( Array.from( this.getElementsByTagName( "optgroup" ) ) ).forEach( option => select.appendChild( option ) );
		( Array.from( this.getElementsByTagName( "option" ) ) ).forEach( option => select.appendChild( option ) );
		this.appendChild( select );

		let check = window.document.createElement( "input-tags-check" );
		check.innerHTML = "✔";
		check.style.color = "green";
		check.style.display = "inline";
		check.addEventListener( "click" , ( event => this.append( select.selectedOptions[ 0 ].innerHTML ) ) );
		this.appendChild( check );
	}
}

window.document.addEventListener( "DOMContentLoaded" , function ( event ) {
	window.customElements.define( "input-tags-entry" , kona_input_tags_entry );
	window.customElements.define( "input-tags-select" , kona_input_tags_select );
} );


