if (typeof honcraft.ui === 'undefined') honcraft.ui = {
    _hero: null,
    _conditions: [[],[],[],[],[],[]]
};
honcraft.ui.ready = function() {
    // Hero selectors
    var $selector = $('#hero-select');
    $.each(honcraft.data.hero, function(i, hero)
    {
        $selector.append('<option>' + honcraft.util.getProperty(hero, 'name') + '</option>');
    });
    honcraft.ui.heroChanged();

    };
honcraft.ui.heroChanged = function()
{
    honcraft.ui._hero = honcraft.hero.getByName($('#hero-select').val());
	honcraft.ui._hero.setLevel(parseInt($('#hero-level').val()));
	honcraft.ui._hero.setAttributeBoosts(parseInt($('#hero-boosts').val()));
    honcraft.ui.showHeroDetails();
}
honcraft.ui.showHeroDetails = function()
{
    var $details = $('#hero-details');
    $details.html('<ul>');
    
    $.each(honcraft.ui._hero, function(i, prop) {
        if (honcraft.ui.isPrintable(prop))
        {
            $details.append('<li>' + i + ': ' + prop + '</li>');
        }
    });
    $details.append('</ul>');
}

honcraft.ui.isPrintable = function(prop) 
{
    var type = typeof prop;
    if (type == 'string' || type == 'number' || type == 'boolean') return true;
}