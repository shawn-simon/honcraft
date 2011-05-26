var ready = function () {
    var hc = honcraft;
    common.debug.setConsole($('#main'));
    var hero = honcraft.hero.getHeroById(169);
    //hero.items.push(honcraft.item.getItemById(2));
    //    common.debug.println(hero);
    //    common.debug.println(honcraft.getDps(hero));
    //    common.debug.println(honcraft.getArmorDamageMultiplier(2.96));
    //    common.debug.println(honcraft.getArmorDamageMultiplier(0));
    //    common.debug.println(honcraft.getArmorDamageMultiplier(-20));
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
    'Item_Damage9',
    'Item_ElderParasite',
    'Item_ManaBurn1',
    'Item_Pierce',
    'Item_HarkonsBlade'
    ];
    var testItems = [];
    $.each(items, function(i, item)
    {
        testItems.push(honcraft.item.getItemByName(item));
    });
    common.debug.println(hero.calculateMaxDps());
//    var crits = [{CRITICALCHANCE: .2, CRITICALMODIFIER: 2.4}];
//    common.debug.println(honcraft.getCritMultiplier(crits));
//    var crits = [{CRITICALCHANCE: .2, CRITICALMODIFIER: 2.0}];
//    common.debug.println(honcraft.getCritMultiplier(crits));
//    var crits = [{CRITICALCHANCE: .2, CRITICALMODIFIER: 2.4}, {CRITICALCHANCE: .25, CRITICALMODIFIER: 2.0}];
//    common.debug.println(honcraft.getCritMultiplier(crits));
//    var crits = [{CRITICALCHANCE: .25, CRITICALMODIFIER: 2.0}, {CRITICALCHANCE: .2, CRITICALMODIFIER: 2.4}];
//    common.debug.println(honcraft.getCritMultiplier(crits));

};
$(ready);