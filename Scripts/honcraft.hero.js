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
				assumption: '',
				events: []

            };
			if (baseHero != null)
			{                
				hero.name = honcraft.util.getProperty(baseHero, 'name');			
				hero.displayName = honcraft.util.getProperty(baseHero, 'displayName');					
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
            hero.calculateAttribute = function (attrName, bonusAttributes) {
				attrName = attrName.toLowerCase();
                var attributeFromItems = 0;
                $.each(hero.items, function (i, item) {
                    attributeFromItems = attributeFromItems + item[attrName];
                });
                var attributeFromLeveling = hero[attrName + 'PerLevel'] * (hero.level - 1);
                var attributeBoosts = 2 * hero.attributeBoosts;
                var baseAttr = hero[attrName];
				var bonusAttr = 0;
				if (typeof bonusAttributes !== 'undefined' && typeof bonusAttributes[attrName] !== 'undefined') {
					bonusAttr = bonusAttributes[attrName];
				}
                return attributeFromItems + attributeFromLeveling + attributeBoosts + baseAttr + bonusAttr;
            };
            hero.getAttacksPerSecond = function (bonusIas) {
                var iasFromItems = bonusIas;
                $.each(hero.items, function (i, item) {
                    iasFromItems = iasFromItems + item.attackSpeed;
                });
                iasFromItems = iasFromItems * 100;
                var iasFromAgility = hero.calculateAttribute('agility');
                var bat = hero.attackCooldown / 1000;
                return honcraft.math.getAttacksPerSecond(bat, iasFromAgility + iasFromItems);
            };
            hero.getBaseDamage = function (bonusAttributes) {
                return (hero.attackDamageMin + hero.attackDamageMax / 2) + hero.calculateAttribute(hero.primaryAttribute, bonusAttributes);
            };
            hero.calculateMaxDpsItems = function (opt) {           
				
				// Get available item pool.
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
                
				// Prepare item slots / conditions.
				var conditions = opt.conditions || [[],[],[],[],[],[]];			                
				// Make each item-slot an array if it is a object.
				$.each(conditions, function(i, item) {
					if (!$.isArray(item))
					{
						conditions[i] = [item];
					}
				});                
                // Sort by array length
				conditions.sort(function(a, b) { return a.length < b.length });				                
                // Differentiate between conditions that search for items, and those that are selected item choices.
                var firstEmptyCondition = conditions.length;
                $.each(conditions, function(s, slot) {                          
                     if (slot.length === 0)
                     {
                        firstEmptyCondition = s;
                        return false
                     }
                 });                 
                var definedConditions = conditions.slice(0, firstEmptyCondition);
                var searchCount = conditions.slice(firstEmptyCondition).length;

				// Prepare result set.
				var result = [];                 
				var targets = opt.targets || honcraft.hero.getSampleTargets();
                $.each(targets, function(i, target) {
                    result.push({target: target, dps: 0});   
				});
                
                honcraft.math.iterateArrayOfArrays(definedConditions, function(testItems) {                                                     
                    // Loop through all item combinations.
                     honcraft.math.getAllCombinations(itemsAvailable.length, searchCount, function (args) {                        
                        hero.items = testItems.slice(0);                    
                        $.each(args, function(i, arg) {
                            hero.items.push(itemsAvailable[arg]);
                        });                        
                        if (maxCost > 0 && honcraft.item.getTotalCost(hero.items) > maxCost) return true; // Item combo costs too much.         
                        
                        var dpsResult = hero.getDps(targets);
                        
                        $.each(targets, function(index, target) {
                            if (dpsResult.byTarget[index].dps > result[index].dps) {
                                result[index] = $.extend($.extend({}, dpsResult), dpsResult.byTarget[index]);
                                result[index].items = hero.items.slice(0);
                                delete result[index].byTarget;
                            }
                        });
                        
					});           
                });
                			         				
                return result;
            };
            hero.getDps = function (incTargets) {

                // Prepare array of targets.
                var targets = [];
                if (typeof incTargets == 'undefined') targets = honcraft.hero.getSampleTargets();                
                else if (!$.isArray(incTargets)) targets.push(incTargets);                
				else targets = incTargets;				
								
				var result = {
					appliedStates: [], // Holds all the states applied in the calculation, so that duplicates will never occur- auras, buffs, debuffs, etc.
					assumptions: [],
					attacksPerSecond: 0,
					baseDamage: 0,
					targetArmorModifier: 0,
					eventAttackSpeed: 0,
					eventDamage: 0,
					eventStrength: 0,					
                    targetMagicArmorModifier: 0,
                    damageAmplification: 1
				}
				
				// Fire equip event.				
				honcraft.eventResult.applyToDpsResult(hero.fireEvent('Equip'), result);
								
                // Calculate base damage;
                result.baseDamage += hero.getBaseDamage({strength: result.eventStrength});
                result.attacksPerSecond = hero.getAttacksPerSecond(result.eventAttackSpeed);
                
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
                result.avgDamagePerHit = (result.baseDamage + result.damageFromItems + result.eventDamage);
                                                 
                result.rawPhysicalDps = result.avgDamagePerHit * result.attacksPerSecond * critMultiplierResult.dpsMultiplier;
                result.rawMagicDps = 0;
				
				// Fire pre-impack event.				
				honcraft.eventResult.applyToDpsResult(hero.fireEvent('PreAttackImpact'), result);
				
				// Fire attack impact event.
				honcraft.eventResult.applyToDpsResult(hero.fireEvent('AttackImpact'), result);

                result.byTarget = [];
                result.items = hero.items;
				if (hero.assumption.length > 0) 
				{
					result.assumptions.push(hero.assumption);
				}

                $.each(targets, function (i, target) {
					var targetResult = {};
					targetResult.armorMultiplier = honcraft.math.getArmorMultiplier(target.armor + result.targetArmorModifier);
					targetResult.magicArmorMultiplier = honcraft.math.getArmorMultiplier(Math.max(target.magicArmor + result.targetMagicArmorModifier, 0));
                    targetResult.dps = result.damageAmplification * ((result.rawPhysicalDps * targetResult.armorMultiplier ) + (result.rawMagicDps * targetResult.magicArmorMultiplier));
                    targetResult.name = target.name;
					targetResult.targetArmor = target.armor;
					targetResult.targetMagicArmor = target.magicArmor;
                    result.byTarget.push(targetResult);
                });

                return result;
            };
            
			hero.fireEvent = function(name, args, includeItems) {
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
						$.merge(results, item.fireEvent(name, args));
					});
				}
				return results;			
			}
            hero.events = honcraft.event.getBySource(hero.name); // note: event is null?
            hero.fireEvent('Created', {hero: hero});
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
        },
	    getAll: function()
		{
			var heroes = [];
			$.each(honcraft.data.hero, function(i, datahero)
			{
				heroes.push(honcraft.hero.create(datahero));
			});
			return heroes.sort(honcraft.util.getArrayAlphaSort('displayName'));
		}
	}; 
	hc.hero.getSampleTargets = function() {
        return [
            hc.hero.create({ name: "Pure Damage", attributes: { ARMOR: 0, MAGICARMOR: 0} }),
            hc.hero.create({ name: "High Armor", attributes: { ARMOR: 30, MAGICARMOR: 5.5} }),
            hc.hero.create({ name: "20 Armor", attributes: { ARMOR: 20, MAGICARMOR: 5.5} }),
            hc.hero.create({ name: "Shamans", attributes: { ARMOR: 10, MAGICARMOR: 15.5} }),
            hc.hero.create({ name: "Mid Game", attributes: { ARMOR: 9, MAGICARMOR: 5.5} }),
        ]	
	}   	
    return hc;
})());



