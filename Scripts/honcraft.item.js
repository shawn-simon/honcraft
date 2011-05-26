if (typeof honcraft === 'undefined') honcraft = {};
$.extend(honcraft, (function () {
    var hc = {};	 
	hc.item = {
		create: function(baseItem) {			
			var item = 
			{
				name: '',              
				strength: 0,
				attackSpeed: 0,
				agility: 0,
				intelligence: 0,
				damage: 0,
				criticalChance: 0,
				criticalMultiplier: 0,
				totalCost: 0,
				events: [],
				assumptions: []

			};
			if (baseItem != null)
			{                
				item.name = honcraft.util.getProperty(baseItem, 'name');
				item.strength = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseItem.attributes, 'strength'));
				item.agility = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseItem.attributes, 'agility'));
				item.intelligence = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseItem.attributes, 'intelligence'));
				item.attackSpeed = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseItem.attributes, 'attackSpeed'));
				item.damage = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseItem.attributes, 'damage'));
				item.criticalChance = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseItem.attributes, 'criticalChance'));
				item.criticalMultiplier = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseItem.attributes, 'criticalMultiplier'));
				item.totalCost = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseItem.attributes, 'totalCost'));
			}
			item.events = honcraft.event.getBySource(item.name);
			item.fireEvent = function(name, args) {
				var results = [];
				$.each(item.events, function(i, e) {
					if (typeof e['on' + name] === 'function') 
					{
						var result = honcraft.eventResult.create(args);
						e['on' + name].call(item, result);
						results.push(result);							
					}
				});
				return results;
			};
			item.fireEvent('Created', {item: item});
			return item;
		},
		getAll: function() {
			var items = [];
			$.each(honcraft.data.item, function(i, baseItem)
			{
				items.push(honcraft.item.create(baseItem));
			});
			return items;
		},            
		getByName: function (name) {
			var result;
			if ($.isArray(name))
			{
				result = [];
				$.each(name, function(i, string)
				{
					result.push(honcraft.item.getByName(string));
				});				
				return result;
			}
			$.each(honcraft.data.item, function (i, item) {
				if (item.name === name) {
					result = item;
				}
			});
			return honcraft.item.create(result);
		},             
		getTotalCost: function (items) {
			var totalCost = 0;
			$.each(items, function(i, item) {
				totalCost += item.totalCost;
			});
			return totalCost;
		},
		getDefaultTestItems: function()	{
			 var items = [
				'Item_EnhancedMarchers',
				'Item_Steamboots',
				'Item_DaemonicBreastplate',
				'Item_Critical1',
				'Item_Insanitarius',
				'Item_ManaBurn2',
				'Item_Silence',
				'Item_Weapon3',
				'Item_Lightning2',
				'Item_Evasion',
				'Item_ElderParasite',
				'Item_ManaBurn1',
				'Item_Pierce',
				'Item_HarkonsBlade'
			];
			var result = [];
			$.each(items, function(i, item)
			{
				 result.push(honcraft.item.getByName(item));
			});
			return result;
		}
	};
    return hc;
})());



