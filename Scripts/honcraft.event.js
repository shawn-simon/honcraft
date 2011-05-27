if (typeof honcraft === 'undefined') honcraft = {};
$.extend(honcraft, (function () {
    var hc = {};	   
	hc.event = {
		create: function() {
			return 	{
				ID: '',
				source: ''
			};
		},
		load: function(events) {
			if (typeof hc.data === 'undefined')
			{
				hc.data = {};
			}
			if (typeof hc.data.event === 'undefined')
			{
				hc.data.event = [];
			}
			$.each(events, function(i, event) {
				hc.data.event.push(event);
			});
		},
		getBySource: function(source)
		{
			var result = [];
			$.each(hc.data.event, function(i, event) 
			{
				if (source === event.source)
				{
					result.push(event);
				}
			});
			return result;
		},
		getByID: function(id)
		{
			var result = null;
			$.each(hc.data.event, function(i, event)
			{
				if (event.ID === id) result = event;
			});
			return result;
		},
		clearAll: function() {
			hc.data.event = [];
		}
	};
	hc.eventResult = {
		create: function(data) {
			var eventResult = data || {};
			eventResult.getNumber = function(property, defaultValue)
			{
				if (defaultValue == null) defaultValue = 0;
				if (typeof eventResult[property] !== 'number')
				{
					return defaultValue;
				}
				return eventResult[property];
			}
			eventResult.getString = function(property, defaultValue)
			{
				if (defaultValue == null) defaultValue = '';
				if (typeof eventResult[property] !== 'string')
				{
					return defaultValue;
				}
				return eventResult[property];
			}
			return eventResult;
		}
	};
    return hc;
})());



