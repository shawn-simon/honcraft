if (typeof honcraft.ui === 'undefined') honcraft.ui = {
    hero: null,
    conditions: [[],[],[],[],[],[]],
	itemsAvailable: []
};
honcraft.ui.ready = function() 
{	
    // Hero selectors
    var $selector = $('#hero-select');	
    $.each(honcraft.hero.getAll(), function(i, hero)
    {
        $selector.append('<option ' + (hero.name == 'Hero_Scout' ? 'selected' : '') + ' value="' + hero.name + '">' + hero.displayName + '</option>');
    });
	
	// Item selectors
    var $selector = $('.item-select');
    $.each(honcraft.item.getAll(), function(i, item)
    {
        $selector.append('<option value="' + item.name + '">' + item.displayName + '</option>');
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
			$parent.append(honcraft.ui.renderCondition(condition, i, j));
		});
	}
	
	// Show item pool.
	var $pool = $('#item-pool').html('');;
	$.each(honcraft.ui.itemsAvailable, function(i, item)
	{
		$pool.append(honcraft.ui.renderPoolItem(item, i));
	});
}
honcraft.ui.addCondition = function(index) 
{
	honcraft.ui.conditions[index].push(honcraft.item.getByName($('#item-select-' + index).val()));
	honcraft.ui.refresh();
	return false;
}
honcraft.ui.renderCondition  = function(item, condIndex1, condIndex2)
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
honcraft.ui.renderPoolItem  = function(item, i)
{
	var html = [];
	html.push('<div class="item"><span class="name">' + item.getName() + '</span> ');
	if (typeof item.toggle == 'function')
	{
		html.push('<span class="toggle action" onclick="honcraft.ui.itemPoolItemAction(' + i + ', \'toggle\')">Toggle</span>');
	}
	html.push('<span class="remove action" onclick="honcraft.ui.itemPoolItemAction(' + i + ', \'remove\')">Remove</span>');
	html.push('</div>');
	return html.join('');
}

honcraft.ui.itemPoolItemAction = function(i, action)
{
	if (action == 'remove')
	{
		honcraft.ui.itemsAvailable.splice(i, 1);
	}
	if (action == 'toggle')
	{
		honcraft.ui.itemsAvailable[i].toggle();
	}
	honcraft.ui.refresh();
}

honcraft.ui.addItemToPool = function()
{
	honcraft.ui.itemsAvailable.push(honcraft.item.getByName($('#item-pool-select').val()));
	honcraft.ui.refresh();
	return false;
}
honcraft.ui.getResults = function()
{
	var maxCost = parseInt($('#cond-cost').val());
	$('#get-results').html('Calculating').attr('disabled', 'disabled');
	var results = honcraft.ui.hero.calculateMaxDpsItems({
		maxCost: maxCost,
        conditions: honcraft.ui.conditions,
		itemsAvailable: honcraft.ui.itemsAvailable
	});
	var $results = $('#results-area').html('');
	$.each(results, function(i, res)
	{
		var html = []
		html.push('<div class="result">');
		html.push('<p class="dps">' + res.dps.toFixed(0) + ' DPS</p>');;
		html.push('<br/>');
		html.push(honcraft.ui.span('Target Name', res.name,'target-name'));
		html.push('<br/>');
		html.push(honcraft.ui.span('Armor', res.targetArmor, 'target'));
		html.push('<br/>');
		html.push(honcraft.ui.span('Magic Armor', res.targetMagicArmor,'target'));
		html.push('<br/>');
		$.each(res.items, function(i, item)
		{
			html.push('<div class="item"><span class="name">' + item.getName() + '</span></div>');
		});
		if (res.assumptions.length > 0)
		{			
			html.push('<div>Calculation Result Notes</div>');
			html.push('<ul>');
		}
		$.each(res.assumptions, function(i, assumption)
		{
			html.push('<li class="assumption">' + assumption + '</li>');
		});
		if (res.assumptions.length > 0)
		{
			html.push('</ul>');
		}

		html.push('<div>More data (mostly internal calculation results)</div>');
		html.push('<ul>');

		$.each(res, function(i, prop)
		{
			if (honcraft.ui.isPrintable(prop))
			{
				html.push('<li class="data-prop">' + i + ': ' + prop + '</li>');
			}
		});
		if (res.assumptions.length > 0)
		{
			html.push('</ul>');
		}
		html.push('</div>');
		$results.append(html.join(''));
	});	
	$('#get-results').html('Refresh Results').attr('disabled', '');
}
honcraft.ui.span = function(name, value, cssclass)
{
	return '<span class="' + cssclass + '">' + name + ': ' + value + '</span>'
}
honcraft.ui.isPrintable = function(prop) 
{
    var type = typeof prop;
    if (type == 'string' || type == 'number' || type == 'boolean') return true;
}
