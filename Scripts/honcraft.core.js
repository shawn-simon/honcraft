var honcraft = (function () {
    var hc =
    {
        getDps: function (hero, targets) {
            var result = {};
            result.baseDamage = hero.getBaseDamage();
            result.attacksPerSecond = hero.getAttacksPerSecond();
            var physicalDps = result.baseDamage * result.attacksPerSecond;
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
                        maxmana: 0,
                        manaregen: 0,
                        armor: 0,
                        magicarmor: 0,
                        attackduration: 1000,
                        attackactiontime: 500,
                        attackcooldown: 1700,
                        attackdamagemin: 0,
                        attackdamagemax: 0,
                        attackrange: 0,
                        attacktype: 'melee',
                        primaryattribute: 'Strength',
                        strength: 0,
                        strengthperlevel: 0,
                        agility: 0,
                        agilityperlevel: 0,
                        intelligence: 0,
                        intelligenceperlevel: 0
                    },
                    attr: function (name) {
                        var attribute = hero.attributes[name.toUpperCase()];
                        if (attribute == null) {
                            return hero.attributes[name.toLowerCase()];
                        }
                        return attribute;
                    },
                    items: [],
                    level: 1,
                    attributeBoosts: 0
                }, baseHero);
                hero.calculateAttribute = function (attrName) {
                    var attributeFromItems = 0;
                    $.each(hero.items, function (i, item) {
                        attributeFromItems = attributeFromItems + parseInt(item.attr(attrName.toUpperCase()), 10);
                    });
                    var attributeFromLeveling = parseInt(hero.attr(attrName.toUpperCase() + 'PERLEVEL'), 10) * (hero.level - 1);
                    var attributeBoosts = 2 * hero.attributeBoosts;
                    var baseAttr = parseInt(hero.attr(attrName), 10)
                    return attributeFromItems + attributeFromLeveling + attributeBoosts + baseAttr;
                };
                hero.getAttacksPerSecond = function () {
                    var iasFromItems = 0;
                    $.each(hero.items, function (i, item) {
                        iasFromItems = iasFromItems + parseInt(item.attr('ATTACKSPEED'), 10);
                    });
                    iasFromItems = iasFromItems * 100;
                    var iasFromAgility = hero.calculateAttribute('AGILITY');
                    var bat = parseInt(hero.attr('attackcooldown'), 10) / 1000;
                    return hc.getAttacksPerSecond(bat, iasFromAgility + iasFromItems);
                };
                hero.getBaseDamage = function () {
                    return ((parseInt(hero.attr('ATTACKDAMAGEMIN'), 10) + parseInt(hero.attr('ATTACKDAMAGEMAX'), 10)) / 2) + hero.calculateAttribute(hero.attr('PRIMARYATTRIBUTE'));
                };
                hero.calculateMaxDps = function () {
                    var result = { byTarget: [{dps: 0}] };
                    honcraft.math.getAllCombinations(honcraft.data.item.length, 2, function (a,b,c,d,e,f) {
                        hero.items = [
                            honcraft.item.create(honcraft.data.item[a]),
                            honcraft.item.create(honcraft.data.item[b]),
                            honcraft.item.create(honcraft.data.item[c]),
                            honcraft.item.create(honcraft.data.item[d]),
                            honcraft.item.create(honcraft.data.item[e]),
                            honcraft.item.create(honcraft.data.item[f])
                            ];
                        var dpsResult = honcraft.getDps(hero);
                        if (dpsResult.byTarget[0].dps > result.byTarget[0].dps) {
                            result = dpsResult;
                            result.items = $.extend(true, [], hero.items);
                        }
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
                        strength: 0,
                        attackspeed: 0,
                        agility: 0,
                        intelligence: 0                        
                    },
                    attr: function (name) {
                        var attribute = item.attributes[name.toUpperCase()];
                        if (attribute == null) {
                            return item.attributes[name.toLowerCase()];
                        }
                        return attribute;
                    }
                }, baseItem);
                return item;
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
        highArmor: hc.hero.create({ name: "High Armor", attributes: { armor: 30, magicArmor: 5.5} }),
        shamansEquipped: hc.hero.create({ name: "Shamans", attributes: { armor: 10, magicArmor: 15.5} }),
        midGame: hc.hero.create({ name: "Mid Game", attributes: { armor: 9, magicArmor: 5.5} })
    };
    return hc;
})();

