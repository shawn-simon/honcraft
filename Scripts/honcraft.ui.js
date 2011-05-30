if (typeof honcraft.ui === 'undefined') honcraft.ui = {
    hero: null,
    conditions: [[],[],[],[],[],[]],
	itemsAvailable: []
};
honcraft.ui.ready = function() 
{	
    // Hero selectors
    var $selector = $('#hero-select');
    $.each(honcraft.data.hero, function(i, hero)
    {
        $selector.append('<option>' + honcraft.util.getProperty(hero, 'name') + '</option>');
    });
	
	// Item selectors
    var $selector = $('.item-select');
    $.each(honcraft.data.item, function(i, hero)
    {
        $selector.append('<option>' + honcraft.util.getProperty(hero, 'name') + '</option>');
    });
	
	// Default conditions

	var intBoots = honcraft.item.getByName('Item_Steamboots');
	intBoots.fireEvent('AttributeChanged', {attribute: 'Intelligence'});
	honcraft.ui.conditions[0].push(intBoots);
	
	var strBoots = honcraft.item.getByName('Item_Steamboots');
	strBoots.fireEvent('AttributeChanged', {attribute: 'Strength'});
	honcraft.ui.conditions[0].push(strBoots);
	
	var agiBoots = honcraft.item.getByName('Item_Steamboots');
	agiBoots.fireEvent('AttributeChanged', {attribute: 'Agility'});
	honcraft.ui.conditions[0].push(agiBoots);
	
	honcraft.ui.conditions[0].push(honcraft.item.getByName('Item_EnhancedMarchers'));
	
	// Set up available items:
	
	honcraft.ui.itemsAvailable = honcraft.item.getDefaultTestItems();
	
    honcraft.ui.refresh();	
};
	
honcraft.ui.refresh = function()
{
    honcraft.ui.hero = honcraft.hero.getByName($('#hero-select').val());
	honcraft.ui.hero.setLevel(parseInt($('#hero-level').val()));
	honcraft.ui.hero.setAttributeBoosts(parseInt($('#hero-boosts').val()));
    var $details = $('#hero-details');
    $details.html('<ul>');
    
    $.each(honcraft.ui.hero, function(i, prop) {
        if (honcraft.ui.isPrintable(prop))
        {
            $details.append('<li>' + i + ': ' + prop + '</li>');
        }
    });
    $details.append('</ul>');
	
	// Show conditions.
	for (var i = 0; i < 6; i++)
	{
		var $parent = $('#cond-' + i).html('');
		if (honcraft.ui.conditions[i].length == 0)
		{
			$parent.html('No items selected for this item slot.');
		}
		$.each(honcraft.ui.conditions[i], function(j, condition)
		{
			$parent.append(honcraft.ui.renderItem(condition, i, j));
		});
	}
	
	// Show item pool.
	$.each(honcraft.ui.conditions[i], function(j, condition)
	{
		$parent.append(honcraft.ui.renderItem(condition, i, j));
	});
}
honcraft.ui.addCondition = function(index) 
{
	honcraft.ui.conditions[index].push(honcraft.item.getByName($('#item-select-' + index).val()));
	honcraft.ui.refresh();
	return false;
}
honcraft.ui.renderItem = function(item, condIndex1, condIndex2)
{
	var html = [];
	html.push('<div class="item"><span class="name">' + item.getName() + '</span> ');
	if (typeof item.toggle == 'function')
	{
		html.push('<span class="toggle action" onclick="honcraft.ui.conditionAction(' + condIndex1 + ' ,' + condIndex2 + ', \'toggle\')">Toggle</span>');
	}
	html.push('<span class="remove action" onclick="honcraft.ui.conditionAction(' + condIndex1 + ' ,' + condIndex2 + ', \'remove\')">Remove</span>');
	html.push('</div>');
	return html.join('');
}
honcraft.ui.conditionAction = function(condIndex1, condIndex2, action)
{
	if (action == 'remove')
	{
		honcraft.ui.conditions[condIndex1].splice(condIndex2, 1);
	}
	if (action == 'toggle')
	{
		honcraft.ui.conditions[condIndex1][condIndex2].toggle();
	}
	honcraft.ui.refresh();
}
honcraft.ui.isPrintable = function(prop) 
{
    var type = typeof prop;
    if (type == 'string' || type == 'number' || type == 'boolean') return true;
}