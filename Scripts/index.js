var ready = function () {

    var hc = honcraft;
    common.debug.setConsole($('#main'));
	
    var hero = honcraft.hero.getByName('Hero_Aluna');
	hero.setLevel(25);
	hero.setAttributeBoosts(10);
	common.debug.println(hero);	
	hero.items.push(honcraft.item.getByName('Item_Critical1'));	
	var itemsAvailable = honcraft.item.getByName(['Item_Insanitarius']);
	var steamboots = honcraft.item.getByName('Item_Steamboots');
	steamboots.fireEvent('AttributeChanged', {attribute: 'intelligence'});
	itemsAvailable.push(steamboots);
	steamboots = honcraft.item.getByName('Item_Steamboots');
	steamboots.fireEvent('AttributeChanged', {attribute: 'strength'});
	itemsAvailable.push(steamboots);
	steamboots = honcraft.item.getByName('Item_Steamboots');
	steamboots.fireEvent('AttributeChanged', {attribute: 'agility'});
	itemsAvailable.push(steamboots);
	var result = hero.calculateMaxDpsItems({
		maxCost: 0
	});
	console.log(result);

	common.debug.println(result);
    
};
$(ready);