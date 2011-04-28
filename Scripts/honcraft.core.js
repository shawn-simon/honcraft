var honcraft = (function () {
    var hc =
    {
        getDps: function (hero, targets) {
            if (!$.isArray(targets)) {
                targets = [targets];
            }
            var result = {};
            result.baseDamage = hero.getBaseDamage();
            result.attacksPerSecond = hero.getAttacksPerSecond();
            result.damageFromItems = 0;
            $.each(hero.items, function(i, item) {
                result.damageFromItems += parseInt(item.attributes.DAMAGE, 10)
            });
            var physicalDps = (result.baseDamage + result.damageFromItems) * result.attacksPerSecond;
            var magicDps = 0;

            result.byTarget = [];
            result.items = hero.items;
            targets = targets || honcraft.sampleTargets;

            $.each(targets, function (i, target) {
                result.byTarget.push({
                    dps: (physicalDps * honcraft.getArmorMultiplier(target.attributes.ARMOR)) + (magicDps * honcraft.getArmorMultiplier(target.attributes.MAGICARMOR)),
                    target: target.name
                })
            });

            return result;
        },

        getAttacksPerSecond: function (BAT, IAS) {
            // BAT in seconds.
            if (BAT <= 0) return 0;
            var aps = Math.floor(20 * (1 + (.01 * IAS)) / BAT) / 20;
            if (aps > 20) return 20;
            if (aps < 0) return 0;
            return aps;
        },

        getArmorMultiplier: function (armor) {
            var multiplier = 1;
            if (armor > 0) {
                multiplier = 1 - ((.06 * armor) / (1 + (.06 * armor)));
            }
            if (armor < 0) {
                multiplier = Math.min(1, Math.pow(.94, armor));

            }
            return multiplier;
        },

        hero:
        {
            create: function (baseHero) {
                var hero = $.extend(true, {
                    name: '',
                    hid: 0,
                    attributes:
                    {
                        NAME: '',
                        MOVESPEED: 0,
                        TURNRATE: 0,
                        MAXHEALTH: 0,
                        HEALTHREGEN: 0,
                        MAXMANA: 0,
                        MANAREGEN: 0,
                        ARMOR: 0,
                        MAGICARMOR: 0,
                        ATTACKDURATION: 1000,
                        ATTACKACTIONTIME: 500,
                        ATTACKCOOLDOWN: 1700,
                        ATTACKDAMAGEMIN: 0,
                        ATTACKDAMAGEMAX: 0,
                        ATTACKRANGE: 0,
                        ATTACKTYPE: 'melee',
                        PRIMARYATTRIBUTE: 'Strength',
                        STRENGTH: 0,
                        STRENGTHPERLEVEL: 0,
                        AGILITY: 0,
                        AGILITYPERLEVEL: 0,
                        INTELLIGENCE: 0,
                        INTELLIGENCEPERLEVEL: 0
                    },
                    attr: function (name) {
                        var attribute = hero.attributes[name];
                        if (attribute == null)    
                            attribute = hero.attributes[name.toLowerCase()];                        
                        if (attribute == null) 
                            attribute = hero.attributes[name.toUpperCase()];
                       return attribute;
                    },
                    items: [],
                    level: 1,
                    attributeBoosts: 0
                }, baseHero);
                hero.calculateAttribute = function (attrName) {
                    var attributeFromItems = 0;
                    $.each(hero.items, function (i, item) {
                        attributeFromItems = attributeFromItems + parseInt(item.attr(attrName), 10);
                    });
                    var attributeFromLeveling = parseInt(hero.attr(attrName.toUpperCase() + 'PERLEVEL'), 10) * (hero.level - 1);
                    var attributeBoosts = 2 * hero.attributeBoosts;
                    var baseAttr = parseInt(hero.attr(attrName), 10)
                    return attributeFromItems + attributeFromLeveling + attributeBoosts + baseAttr;
                };
                hero.getAttacksPerSecond = function () {
                    var iasFromItems = 0;
                    $.each(hero.items, function (i, item) {
                        iasFromItems = iasFromItems + parseInt(item.attributes.ATTACKSPEED, 10);
                    });
                    iasFromItems = iasFromItems * 100;
                    var iasFromAgility = hero.calculateAttribute('AGILITY');
                    var bat = parseInt(hero.attributes.ATTACKCOOLDOWN, 10) / 1000;
                    return hc.getAttacksPerSecond(bat, iasFromAgility + iasFromItems);
                };
                hero.getBaseDamage = function () {
                    return ((parseInt(hero.attributes.ATTACKDAMAGEMIN, 10) + parseInt(hero.attributes.ATTACKDAMAGEMAX, 10)) / 2) + hero.calculateAttribute(hero.attributes.PRIMARYATTRIBUTE);
                };
                hero.calculateMaxDps = function (targets, itemsAvailable) {
                    itemsAvailable = itemsAvailable || honcraft.item.getAllItems().splice(0, 15);
                    var result = [];                    
                    $.each(targets || honcraft.sampleTargets, function(key, target)
                    {
                        var i = result.length;
                        result.push({target: target, dps: 0});                        
                        honcraft.math.getAllCombinations(itemsAvailable.length, 6, function (a, b, c, d, e, f) {
                            hero.items = [itemsAvailable[a], itemsAvailable[b], itemsAvailable[c], itemsAvailable[d], itemsAvailable[e], itemsAvailable[f]];                        
                            var dpsResult = honcraft.getDps(hero, target);
                            if (dpsResult.byTarget[0].dps > result[i].dps) {
                                result[i].dps = dpsResult.byTarget[0].dps;
                                result[i].items = hero.items.slice(0);
                                result[i].dpsResult = dpsResult;
                            }
                        });                        
                    });
                    return result;
                };
                return hero;
            },

            getHeroById: function (id) {
                var result;
                $.each(honcraft.data.hero, function (i, hero) {
                    if (hero.hid === id) {
                        result = hero;
                    }
                });
                return honcraft.hero.create(result);
            }

        },
        item: {
            create: function(baseItem)
            {
                var item = $.extend(true, {
                    attributes: {
                        STRENGTH: 0,
                        ATTACKSPEED: 0,
                        AGILITY: 0,
                        INTELLIGENCE: 0,
                        DAMAGE: 0                        
                    },
                    attr: function (name) {
                        var attribute = item.attributes[name];
                        if (attribute == null)    
                            attribute = item.attributes[name.toLowerCase()];                        
                        if (attribute == null) 
                            attribute = item.attributes[name.toUpperCase()];
                       return attribute;
                    }        
                }, baseItem);
                return item;
            },
            getAllItems: function()
            {
                var items = [];
                $.each(honcraft.data.item, function(i, baseItem)
                {
                    items.push(honcraft.item.create(baseItem));
                });
                return items;
            },            
            getItemById: function (id) {
                var result;
                $.each(honcraft.data.item, function (i, item) {
                    if (item.id === id) {
                        result = item;
                    }
                });
                return honcraft.item.create(result);
            },      
        },
        math: {
            getAllCombinations: function (n, k, callback) {
                var iterate = function (remaining, args) {
                    var len = args.length;
                    for (var i = args[len - 1]; i < n; i++) {
                        args.splice(len);
                        args[len - 1] = i;
                        if (remaining) {
                            args[len] = i;
                            iterate(remaining - 1, args);
                        }
                        else {
                            callback.apply(null, args);
                        }
                    }
                }
                iterate(k - 1, [0]);
            }
        }
    }
    hc.sampleTargets =
    {
        pureDamage: hc.hero.create({ name: "Pure Damage", attributes: { ARMOR: 0, MAGICARMOR: 0} }),
        highArmor: hc.hero.create({ name: "High Armor", attributes: { ARMOR: 30, MAGICARMOR: 5.5} }),
        shamansEquipped: hc.hero.create({ name: "Shamans", attributes: { ARMOR: 10, MAGICARMOR: 15.5} }),
        midGame: hc.hero.create({ name: "Mid Game", attributes: { ARMOR: 9, MAGICARMOR: 5.5} })
    };
    return hc;
})();
