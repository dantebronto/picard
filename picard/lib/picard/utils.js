var utils = {
  
  merge: function() {
  	// copy reference to target object
  	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy

  	// Handle a deep copy situation
  	if ( typeof target === "boolean" ) {
  		deep = target
  		target = arguments[1] || {}
  		// skip the boolean and the target
  		i = 2
  	}

  	// Handle case when target is a string or something (possible in deep copy)
  	if ( typeof target !== "object" && typeof(target) !== 'function' ) {
  		target = {}
  	}

  	// extend Picard itself if only one argument is passed
  	if ( length === i ) {
  		target = this
  		--i
  	}

  	for ( ; i < length; i++ ) {
  		// Only deal with non-null/undefined values
  		if ( (options = arguments[ i ]) != null ) {
  			// Extend the base object
  			for ( name in options ) {
  				src = target[ name ]
  				copy = options[ name ]

  				// Prevent never-ending loop
  				if ( target === copy ) {
  					continue
  				}

  				// Recurse if we're merging object literal values or arrays
  				if ( deep && copy && ( this.is_plain_object(copy) === 'object' || this.is_array(copy)  ) ) {
  					var clone = src && ( this.is_plain_object(src) || this.is_array(src) ) ? src
  						: this.is_array(copy) ? [] : {}

  					// Never move original objects, clone them
  					target[ name ] = this.merge( deep, clone, copy )

  				// Don't bring in undefined values
  				} else if ( copy !== undefined ) {
  					target[ name ] = copy
  				}
  			}
  		}
  	}

  	// Return the modified object
  	return target
  },
  
  is_array: function( obj ) {
  	return toString.call(obj) === "[object Array]"
  },
  
  is_plain_object: function( obj ) {
  	if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
  		return false;
  	}
  	if ( obj.constructor
  		&& !hasOwnProperty.call(obj, "constructor")
  		&& !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
  		return false;
  	}
  	var key;
  	for ( key in obj ) {}
  	return key === undefined || hasOwnProperty.call( obj, key )
  }
}

Picard.merge = utils.merge