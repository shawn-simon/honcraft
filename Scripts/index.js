var ready = function () {

    var hc = honcraft;
    common.debug.setConsole($('#main'));
	
    var hero = honcraft.hero.getByName('Hero_Aluna');

	hero.setLevel(25);
	hero.setAttributeBoosts(10);
	common.debug.println(hero);	
    
	var intBoots = honcraft.item.getByName('Item_Steamboots');
	intBoots.fireEvent('AttributeChanged', {attribute: 'intelligence'});
    
	var strBoots = honcraft.item.getByName('Item_Steamboots');
	strBoots.fireEvent('AttributeChanged', {attribute: 'strength'});
    
	var agiBoots  = honcraft.item.getByName('Item_Steamboots');
	agiBoots.fireEvent('AttributeChanged', {attribute: 'agility'});
    
    var ghostMarchers = honcraft.item.getByName('Item_EnhanceMarchers');
   
    var nullstone = honcraft.item.getByName('Item_Protect');
    
    
	var result = hero.calculateMaxDpsItems({
		maxCost: 0,
        conditions: [
                     [intBoots, ghostMarchers, strBoots, agiBoots],
                     [nullstone],
                     [nullstone],
                     [nullstone],
                     [nullstone],
                     [nullstone],
                     ]
	});
       

	common.debug.println(result);
    

    
};
$(ready);