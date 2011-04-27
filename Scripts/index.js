var ready = function () {
    var hc = honcraft;
    common.debug.setConsole($('#main'));
    var hero = honcraft.hero.getHeroById(169);
    //hero.items.push(honcraft.item.getItemById(2));
    //    common.debug.println(hero);
        common.debug.println(honcraft.getDps(hero));
    //    common.debug.println(honcraft.getArmorDamageMultiplier(2.96));
    //    common.debug.println(honcraft.getArmorDamageMultiplier(0));
    //    common.debug.println(honcraft.getArmorDamageMultiplier(-20));
    common.debug.println(hero.calculateMaxDps());

};
$(ready);