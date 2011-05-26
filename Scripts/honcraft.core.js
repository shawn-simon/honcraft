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
                attributeBoosts: 0
            };
			if (baseHero != null)
			{                
				hero.name = hc.util.getProperty(baseHero, 'name');				
				hero.maxHealth = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'maxHealth'));
				hero.healthRegen = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'healthRegen'));
				hero.maxMana = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'maxMana'));
				hero.manaRegen = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'manaRegen'));
				hero.armor = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'armor'));
				hero.magicArmor = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'magicArmor'));
				hero.attackDuration = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'attackDuration'));
				hero.attackActionTime = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'attackActionTime'));
				hero.attackCooldown = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'attackCooldown'));
				hero.attackDamageMin = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'attackDamageMin'));
				hero.attackDamageMax = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'attackDamageMax'));
				hero.attackRange = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'attackRange'));
				hero.attackType = hc.util.getProperty(baseHero.attributes, 'attackType');
				hero.primaryAttribute = hc.util.getProperty(baseHero.attributes, 'primaryAttribute');
				hero.strength = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'strength'));
				hero.agility = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'agility'));
				hero.intelligence = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'intelligence'));
				hero.strengthPerLevel = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'strengthPerLevel'));
				hero.agilityPerLevel = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'agilityPerLevel'));
				hero.intelligencePerLevel = hc.util.parseNumberAttr(hc.util.getProperty(baseHero.attributes, 'intelligencePerLevel'));
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
                return hc.math.getAttacksPerSecond(bat, iasFromAgility + iasFromItems);
            };
            hero.getBaseDamage = function () {
                return (hero.attackDamageMin + hero.attackDamageMax / 2) + hero.calculateAttribute(hero.primaryAttribute);
            };
            hero.calculateMaxDpsItems = function (opt) {                
				var itemsAvailable = opt.itemsAvailable || honcraft.tools.getDefaultTestItems();
                
				
				// Check if max cost search is enabled.
				var maxCost = opt.maxCost || 0;
				if (maxCost > 0)
				{
					// Add an empty-slot item.
					var emptySlot = hc.item.create();
					emptySlot.name = 'Item_EmptySlot';
					itemsAvailable.push(emptySlot);
				}

				// Prepare result set.
				var result = [];                 
				var targets = opt.targets || honcraft.tools.sampleTargets.all();
                $.each(targets, function(i, target)
                {
                    result.push({target: target, dps: 0});   
				});

				// Loop through all item combinations.
                honcraft.math.getAllCombinations(itemsAvailable.length, 6, function (a, b, c, d, e, f) {				
					hero.items = [itemsAvailable[a], itemsAvailable[b], itemsAvailable[c], itemsAvailable[d], itemsAvailable[e], itemsAvailable[f]];                    
					
					if (maxCost > 0 && hc.item.getTotalCost(hero.items) > maxCost) return true; // Item combo costs too much.
					
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
			
                // Prepare array of targets.
                var targets = [];
                if (typeof incTargets == 'undefined')
                {
                    targets = hc.tools.sampleTargets.all();
                }
                else if (!$.isArray(incTargets)) 
                {
                    targets.push(incTargets);
                }
				else 
				{
					targets = incTargets;
				}
  
                var result = {};
                
                // Calculate base damage;
                result.baseDamage = hero.getBaseDamage();
                result.attacksPerSecond = hero.getAttacksPerSecond();
                
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
                var critMultiplierResult = hc.math.getCritMultiplier(critModifiers);
                
                result.totalCriticalChance = critMultiplierResult.totalCriticalChance;
                result.criticalHitDpsMultiplier = critMultiplierResult.dpsMultiplier;
                
                // Get average damage per hit, including critical strike damage. 
                result.avgDamagePerHit = (result.baseDamage + result.damageFromItems);
                                                 
                var physicalDps =  result.avgDamagePerHit * result.attacksPerSecond * critMultiplierResult.dpsMultiplier;
                var magicDps = 0;

                result.byTarget = [];
                result.items = hero.items;

                $.each(targets, function (i, target) {
                    result.byTarget.push({
                        dps: (physicalDps * honcraft.math.getArmorMultiplier(target.armor)) + (magicDps * honcraft.math.getArmorMultiplier(target.magicArmor)),
                        target: target.name
                    })
                });

                return result;
            };
            return hero;
        },
		getByName: function (name) {			
			var result;
			$.each(honcraft.data.hero, function (i, hero) {
				if (hero.name === name) {
					result = hero;
				}
			});
			return hc.hero.create(result);
        } 
    };    
	hc.item = {
		create: function(baseItem) {			
			var item = 
			{
				name: '',              
				strength: 0,
				attackSpeed: 0,
				agility: 0,
				intelligence: 0,
				damage: 0,
				criticalChance: 0,
				criticalMultiplier: 0,
				totalCost: 0

			};
			if (baseItem != null)
			{                
				item.name = hc.util.getProperty(baseItem, 'name');
				item.strength = hc.util.parseNumberAttr(hc.util.getProperty(baseItem.attributes, 'strength'));
				item.agility = hc.util.parseNumberAttr(hc.util.getProperty(baseItem.attributes, 'agility'));
				item.intelligence = hc.util.parseNumberAttr(hc.util.getProperty(baseItem.attributes, 'intelligence'));
				item.attackSpeed = hc.util.parseNumberAttr(hc.util.getProperty(baseItem.attributes, 'attackSpeed'));
				item.damage = hc.util.parseNumberAttr(hc.util.getProperty(baseItem.attributes, 'damage'));
				item.criticalChance = hc.util.parseNumberAttr(hc.util.getProperty(baseItem.attributes, 'criticalChance'));
				item.criticalMultiplier = hc.util.parseNumberAttr(hc.util.getProperty(baseItem.attributes, 'criticalMultiplier'));
				item.totalCost = hc.util.parseNumberAttr(hc.util.getProperty(baseItem.attributes, 'totalCost'));
			}
			return item;
		},
		getAll: function() {
			var items = [];
			$.each(honcraft.data.item, function(i, baseItem)
			{
				items.push(honcraft.item.create(baseItem));
			});
			return items;
		},            
		getByName: function (name) {
			var result;
			if ($.isArray(name))
			{
				result = [];
				$.each(name, function(i, string)
				{
					result.push(hc.item.getByName(string));
				});				
				return result;
			}
			$.each(honcraft.data.item, function (i, item) {
				if (item.name === name) {
					result = item;
				}
			});
			return hc.item.create(result);
		},             
		getTotalCost: function (items) {
			var totalCost = 0;
			$.each(items, function(i, item) {
				totalCost += item.totalCost;
			});
			return totalCost;
		}
	};
    hc.math = {
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
		},
		getCritMultiplier: function(critMultipliers) {            
			critMultipliers.sort(function(a, b) {return b.criticalMultiplier - a.criticalMultiplier});
			var dpsMultiplier = 1;                   
			var totalCriticalChance = 0;             
			$.each(critMultipliers, function (i, critMultiplier) {                
				var diminishedChance = (1 - totalCriticalChance) * critMultiplier.criticalChance;
				dpsMultiplier = dpsMultiplier + (diminishedChance * (critMultiplier.criticalMultiplier - 1));
				totalCriticalChance += diminishedChance; 
			});
						
			return {dpsMultiplier: dpsMultiplier, totalCriticalChance: totalCriticalChance};            
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
	};
    hc.util = {
		parseNumberAttr: function(string) {
			// Parses S2 item format when a skill has multiple levels / increased by recipe. Ex: Parsing Damage="10,20,30" returns 30.			
			if (typeof string === 'number') return string;
			if (typeof string === 'undefined') return 0;			
			if (string == null) return 0;
			var split = string.split(',');
			return parseFloat(split[split.length - 1]);
		},
		getProperty: function(object, name)	{
			var prop = object[name];
			if (typeof prop == 'undefined')    
				prop = object[name.toLowerCase()];                        
			if (typeof prop == 'undefined') 
				prop = object[name.toUpperCase()];
			if (typeof prop == 'undefined') 
				prop = null;
			return prop;
		}
	};
    hc.tools = {   
		sampleTargets: {
			pureDamage: hc.hero.create({ name: "Pure Damage", attributes: { ARMOR: 0, MAGICARMOR: 0} }),
			highArmor: hc.hero.create({ name: "High Armor", attributes: { ARMOR: 30, MAGICARMOR: 5.5} }),
			shamansEquipped: hc.hero.create({ name: "Shamans", attributes: { ARMOR: 10, MAGICARMOR: 15.5} }),
			midGame: hc.hero.create({ name: "Mid Game", attributes: { ARMOR: 9, MAGICARMOR: 5.5} }),
			all : function() {
				return [hc.tools.sampleTargets.pureDamage, hc.tools.sampleTargets.highArmor, hc.tools.sampleTargets.shamansEquipped, hc.tools.sampleTargets.midGame];
			}
		},
		getDefaultTestItems: function()	{
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
				'Item_ElderParasite',
				'Item_ManaBurn1',
				'Item_Pierce',
				'Item_HarkonsBlade'
			];
			var result = [];
			$.each(items, function(i, item)
			{
				 result.push(hc.item.getByName(item));
			});
			return result;
		}
	};
    return hc;
})());



