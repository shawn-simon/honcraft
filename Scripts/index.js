var ready = function () {

    var hc = honcraft;
    common.debug.setConsole($('#main'));
	
    var hero = honcraft.hero.getByName('Hero_Aluna');
	hero.setLevel(25);
	hero.setAttributeBoosts(10);
	hero.items.push(honcraft.item.getByName('Item_Critical1'));	
	var result = hero.calculateMaxDpsItems({
		maxCost: 9500, 
		itemsAvailable: honcraft.item.getByName(['Item_Steamboots', 'Item_EnhancedMarchers', 'Item_Weapon3'])
	});
	common.debug.println(result);
    
};
$(ready);