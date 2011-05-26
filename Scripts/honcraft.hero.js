if (typeof honcraft === 'undefined') honcraft = {};
$.extend(honcraft, (function () {
    var hc = {};	
    hc.hero = {
	    create: function (baseHero) {			
            var hero = {
                name: '',                
				maxHealth: 0,
				healthRegen: 0,
				maxMana: 0,
				manaRegen: 0,
				armor: 0,
				magicArmor: 0,
				attackDuration: 1000,
				attackActionTime: 500,
				attackCooldown: 1700,
				attackDamageMin: 0,
				attackDamageMax: 0,
				attackRange: 0,
				attackType: 'melee',
				primaryAttribute: 'Strength',
				strength: 0,
				strengthPerLevel: 0,
				agility: 0,
				agilityPerLevel: 0,
				intelligence: 0,
				intelligencePerLevel: 0,
                items: [],
                level: 1,
                attributeBoosts: 0,
				assumptions: [],
				events: []

            };
			if (baseHero != null)
			{                
				hero.name = honcraft.util.getProperty(baseHero, 'name');				
				hero.maxHealth = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'maxHealth'));
				hero.healthRegen = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'healthRegen'));
				hero.maxMana = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'maxMana'));
				hero.manaRegen = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'manaRegen'));
				hero.armor = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'armor'));
				hero.magicArmor = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'magicArmor'));
				hero.attackDuration = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'attackDuration'));
				hero.attackActionTime = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'attackActionTime'));
				hero.attackCooldown = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'attackCooldown'));
				hero.attackDamageMin = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'attackDamageMin'));
				hero.attackDamageMax = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'attackDamageMax'));
				hero.attackRange = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'attackRange'));
				hero.attackType = honcraft.util.getProperty(baseHero.attributes, 'attackType');
				hero.primaryAttribute = honcraft.util.getProperty(baseHero.attributes, 'primaryAttribute');
				hero.strength = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'strength'));
				hero.agility = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'agility'));
				hero.intelligence = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'intelligence'));
				hero.strengthPerLevel = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'strengthPerLevel'));
				hero.agilityPerLevel = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'agilityPerLevel'));
				hero.intelligencePerLevel = honcraft.util.parseNumberAttr(honcraft.util.getProperty(baseHero.attributes, 'intelligencePerLevel'));
			}
			hero.setLevel = function(setLevel) {
				hero.level = setLevel;
			};
			hero.setAttributeBoosts = function(attributeBoosts) {
				hero.attributeBoosts = attributeBoosts;
			};
            hero.calculateAttribute = function (attrName) {
				attrName = attrName.toLowerCase();
                var attributeFromItems = 0;
                $.each(hero.items, function (i, item) {
                    attributeFromItems = attributeFromItems + item[attrName];
                });
                var attributeFromLeveling = hero[attrName + 'PerLevel'] * (hero.level - 1);
                var attributeBoosts = 2 * hero.attributeBoosts;
                var baseAttr = hero[attrName];
                return attributeFromItems + attributeFromLeveling + attributeBoosts + baseAttr;
            };
            hero.getAttacksPerSecond = function () {
                var iasFromItems = 0;
                $.each(hero.items, function (i, item) {
                    iasFromItems = iasFromItems + item.attackSpeed;
                });
                iasFromItems = iasFromItems * 100;
                var iasFromAgility = hero.calculateAttribute('agility');
                var bat = hero.attackCooldown / 1000;
                return honcraft.math.getAttacksPerSecond(bat, iasFromAgility + iasFromItems);
            };
            hero.getBaseDamage = function () {
                return (hero.attackDamageMin + hero.attackDamageMax / 2) + hero.calculateAttribute(hero.primaryAttribute);
            };
            hero.calculateMaxDpsItems = function (opt) {                
				var itemsAvailable = opt.itemsAvailable || honcraft.item.getDefaultTestItems();
                
				
				// Check if max cost search is enabled.
				var maxCost = opt.maxCost || 0;
				if (maxCost > 0)
				{
					// Add an empty-slot item.
					var emptySlot = honcraft.item.create();
					emptySlot.name = 'Item_EmptySlot';
					itemsAvailable.push(emptySlot);
				}

				// Prepare result set.
				var result = [];                 
				var targets = opt.targets || honcraft.hero.sampleTargets.all();
                $.each(targets, function(i, target)
                {
                    result.push({target: target, dps: 0});   
				});

				// Loop through all item combinations.
                honcraft.math.getAllCombinations(itemsAvailable.length, 6, function (a, b, c, d, e, f) {				
					hero.items = [itemsAvailable[a], itemsAvailable[b], itemsAvailable[c], itemsAvailable[d], itemsAvailable[e], itemsAvailable[f]];                    
					
					if (maxCost > 0 && honcraft.item.getTotalCost(hero.items) > maxCost) return true; // Item combo costs too much.
					
					var dpsResult = hero.getDps(targets);

					$.each(targets, function(index, target)
					{
						if (dpsResult.byTarget[index].dps > result[index].dps) {
						result[index].dps = dpsResult.byTarget[index].dps;
						result[index].items = hero.items.slice(0);
						result[index].dpsResult = dpsResult;
					}
					});
				});                        
				
                return result;
            };
            hero.getDps = function (incTargets) {
				var result = {};
				
                // Prepare array of targets.
                var targets = [];
                if (typeof incTargets == 'undefined')
                {
                    targets = honcraft.hero.sampleTargets.all();
                }
                else if (!$.isArray(incTargets)) 
                {
                    targets.push(incTargets);
                }
				else 
				{
					targets = incTargets;
				}
				
				 
				// Holds all the states applied in the calculation, so that duplicates will never occur- auras, buffs, debuffs, etc.
				result.appliedStates = [];
				result.assumptions = [];
				result.attacksPerSecond = 0;
				result.baseDamage = 0;
				result.targetArmorBuff = 0;
				// Fire equip event.
				var eventResults = hero.fireEvent('Equip');
				$.each(eventResults, function(j, eventResult) 
				{
					var state = eventResult.getString('applyState');
					if (state.length > 0)
					{
						if (result.appliedStates.indexOf(state) == -1)
						{
							result.appliedStates.push(state);
						}
						else
						{
							return true;
						}
					}
					result.attacksPerSecond += eventResult.getNumber('addAttackSpeed');
					result.targetArmorBuff += eventResult.getNumber('addTargetArmor');
					result.assumptions.push(eventResult.getString('assumption'));
				});
				
                // Calculate base damage;
                result.baseDamage += hero.getBaseDamage();
                result.attacksPerSecond += hero.getAttacksPerSecond();
                
                // Get +dmg and crit modifiers from items.
                result.damageFromItems = 0;            
                var critModifiers = [];
                
                $.each(hero.items, function(i, item) {
                    result.damageFromItems += item.damage;
                    if (item.criticalChance != null)
                    {
                        critModifiers.push({criticalChance: item.criticalChance, criticalMultiplier: item.criticalMultiplier});
                    }
                });
                
                // Add innate hero crit modifier (if any - only 1 is supported since it doesn't make sense to have a hero with multiple crit abilities).
                if (hero.critModifier != null)
                {
                    critModifiers.push(hero.critModifier);
                }
                
                // Calculate crit damage            
                var critMultiplierResult = honcraft.math.getCritMultiplier(critModifiers);
                
                result.totalCriticalChance = critMultiplierResult.totalCriticalChance;
                result.criticalHitDpsMultiplier = critMultiplierResult.dpsMultiplier;
                
                // Get average damage per hit, including critical strike damage. 
                result.avgDamagePerHit = (result.baseDamage + result.damageFromItems);
                                                 
                var physicalDps =  result.avgDamagePerHit * result.attacksPerSecond * critMultiplierResult.dpsMultiplier;
                var magicDps = 0;

				/// Fire attack impact event.
				var eventResults = hero.fireEvent('AttackImpact');						
				$.each(eventResults, function(j, eventResult) 
				{
					physicalDps += result.attacksPerSecond * eventResult.getNumber('addPhysicalDamage');					
				});

                result.byTarget = [];
                result.items = hero.items;

                $.each(targets, function (i, target) {
                    result.byTarget.push({
                        dps: (physicalDps * honcraft.math.getArmorMultiplier(target.armor + result.targetArmorBuff)) + (magicDps * honcraft.math.getArmorMultiplier(target.magicArmor)),
                        target: target.name
                    })
                });

                return result;
            };
			hero.fireEvent = function(name, args, includeItems)
			{
				var results = [];				
				$.each(hero.events, function(i, e) {
					if (typeof e['on' + name] === 'function') 					
					{					
						var result = honcraft.eventResult.create(args);
						e['on' + name].call(hero, result);
						results.push(result);				
					}
				});
				if (typeof includeItems == 'undefined' || includeItems == null || includeItems !== false)
				{
					$.each(hero.items, function(i, item) {
						$.merge(results, item.fireEvent(name, honcraft.eventResult.create(args)));
					});
				}
				return results;			
			}
            return hero;
        },
		getByName: function (name) {			
			var result;
			$.each(honcraft.data.hero, function (i, hero) {
				if (hero.name === name) {
					result = hero;
				}
			});
			return honcraft.hero.create(result);
        }    
	}; 
	hc.hero.sampleTargets = {
		pureDamage: hc.hero.create({ name: "Pure Damage", attributes: { ARMOR: 0, MAGICARMOR: 0} }),
		highArmor: hc.hero.create({ name: "High Armor", attributes: { ARMOR: 30, MAGICARMOR: 5.5} }),
		shamansEquipped: hc.hero.create({ name: "Shamans", attributes: { ARMOR: 10, MAGICARMOR: 15.5} }),
		midGame: hc.hero.create({ name: "Mid Game", attributes: { ARMOR: 9, MAGICARMOR: 5.5} }),
		all : function() {
			return [honcraft.hero.sampleTargets.pureDamage, honcraft.hero.sampleTargets.highArmor, honcraft.hero.sampleTargets.shamansEquipped, honcraft.hero.sampleTargets.midGame];
		}
	}   	
    return hc;
})());



