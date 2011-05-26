(function() {
	
	var events = [];
	
	var e = honcraft.event.create();
	e.ID = 'default.savage-mace';
	e.source = 'Item_Weapon3';
	e.onAttackImpact = function() {
		return {addPhysicalDamage: 35}
	};
	events.push(e);
	
	honcraft.event.load(events);
	
})();
