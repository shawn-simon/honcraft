if (typeof honcraft === 'undefined') honcraft = {};
$.extend(honcraft, (function () {
    var hc = {};	
    hc.util = {
		parseNumberAttr: function(input) {
			// Parses S2 item format when a skill has multiple levels / increased by recipe. Ex: Parsing Damage="10,20,30" returns 30.			
			if (typeof input === 'number') return input;
			if (typeof input === 'undefined') return 0;			
			if (input == null) return 0;
			var split = input.split(',');
			return parseFloat(split[split.length - 1]);
		},
		getProperty: function(object, name)	{
			var prop = object[name];
			if (typeof prop == 'undefined')    
				prop = object[name.toLowerCase()];                        
			if (typeof prop == 'undefined') 
				prop = object[name.toUpperCase()];
			if (typeof prop == 'undefined') 
				prop = null;
			return prop;
		}
	};
    return hc;
})());



