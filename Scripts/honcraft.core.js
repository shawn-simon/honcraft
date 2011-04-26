var honcraft = (function () {
    var hc =
    {
        getDps: function (hero, targets) {
            var result = {},
                attr = hero.attributes;
            result.baseDamage = ((parseInt(attr.ATTACKDAMAGEMIN, 10) + parseInt(attr.ATTACKDAMAGEMAX, 10)) / 2) + hero.calculateAttribute(hero.attributes.PRIMARYATTRIBUTE);

            var physicalDamage = result.baseDamage;
            var magicDamage = 0;

            result.byTarget = [];
            targets = targets || [honcraft.sampleTargets.pureDamage];
            $.each(targets, function (i, target) {
                result.byTarget.push({
                    dps: (physicalDamage * honcraft.getArmorMultiplier(target.attributes.ARMOR)) + (magicDamage * honcraft.getArmorMultiplier(target.attributes.MAGICARMOR)),
                    target: target
                })
            });
            return result;
        },

        getAttacksPerSecond: function (BAT, AS) {
            return 0;
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
                        COMBATTYPE: 'Hero',
                        AGGRORANGE: 0,
                        SIGHTRANGEDAY: 0,
                        SIGHTRANGENIGHT: 0,
                        WANDERRANGE: 0,
                        PRIMARYATTRIBUTE: 'Strength',
                        STRENGTH: 0,
                        STRENGTHPERLEVEL: 0,
                        AGILITY: 0,
                        AGILITYPERLEVEL: 0,
                        INTELLIGENCE: 0,
                        INTELLIGENCEPERLEVEL: 0
                    },
                    items: [],
                    level: 1,
                    attributeBoosts: 0
                }, baseHero);
                hero.calculateAttribute = function (attrName) {
                    var attributeFromItems = 0;
                    $.each(hero.items, function (i, item) {
                        attributeFromItems = attributeFromItems + parseInt(item.attributes[attrName.toUpperCase()], 10);
                    });
                    var attributeFromLeveling = parseInt(hero.attributes[attrName.toUpperCase() + 'PERLEVEL'], 10) * (hero.level - 1);
                    var attributeBoosts = 2 * hero.attributeBoosts;
                    var baseAttr = parseInt(hero.attributes[attrName.toUpperCase()], 10)
                    return attributeFromItems + attributeFromLeveling + attributeBoosts + baseAttr;
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
            getItemById: function (id) {
                var result;
                $.each(honcraft.data.item, function (i, item) {
                    if (item.id === id) {
                        result = item;
                    }
                });
                return result;
            }
        }
    }
    hc.sampleTargets =
    {
        pureDamage: hc.hero.create({ name: "Pure Damage", attributes: { ARMOR: 0, MAGICARMOR: 0} }),
        highArmor: hc.hero.create({ name: "High Armor", attributes: { armor: 30, magicArmor: 5.5} }),
        shamansEquipped: hc.hero.create({ name: "Shamans", attributes: { armor: 10, magicArmor: 15.5} })
    };
    return hc;
})();