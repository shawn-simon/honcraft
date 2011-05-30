(function() {
	
	var events = [];
	
	var e = honcraft.event.create();
	e.source = 'Item_Steamboots';
	e.onAttributeChanged = function(args) {				
		this.strength = this.agility = this.intelligence = 0;
		if (args.attribute == 'Strength')
		{
			this.strength = 10;
            this._attr = 'Strength';
		}
		if (args.attribute == 'Intelligence')
		{
			this.intelligence = 10;
            this._attr = 'Intelligence'
		}
		if (args.attribute == 'Agility')
		{
			this.agility = 10;
            this._attr = 'Agility';
		}
		this.displayName = 'Steamboots (' + this._attr + ')';
	};
	events.push(e);
	
    var e = honcraft.event.create();
	e.source = 'Item_Steamboots';
	e.onCreated = function(args) {			
        if (this._attr == null)
        {
            this._attr = 'Strength';
        }
		this.displayName = 'Steamboots (' + this._attr + ')';
		var that = this;
		this.toggle = function() 
		{
			switch (that._attr)
			{
				case "Strength":
					that._attr = "Intelligence";
					break;
				case "Intelligence":
					that._attr = "Agility";
					break;
				case "Agility":
					that._attr = "Strength";
					break;
			}		
			that.fireEvent('AttributeChanged', that._attr);
		}
	};
	
	events.push(e);
    
	var e = honcraft.event.create();
	e.source = 'Item_Critical1';
	e.onCreated = function(args) {			
		this.totalCost = 5500;
	};
	events.push(e);
	
	var e = honcraft.event.create();
	e.source = 'Item_Weapon3';
	e.onAttackImpact = function(args) {
		args.addPhysicalDamage = 35;		
	};
	events.push(e);
	
	var e = honcraft.event.create();
	e.source = 'Item_DaemonicBreastplate';
	e.onEquip = function(args) { 
		args.applyState = 'State_DaemonicBreastplate';
		args.addAttackSpeed = .15;
		args.addTargetArmor = -5;	
		args.assumption = 'Target is affected by -5 armor from Demonic Breastplate.';
	};
	events.push(e);
	
	var e = honcraft.event.create();
	e.source = 'Item_Insanitarius';
	e.onEquip = function(args) { 
		args.applyState = 'State_Insanitarius';
		args.addAttackSpeed = .1;
		args.addDamage = 31;
		args.addStrength = 25;		
		args.assumption = 'Insanitarius is active.';
	};
	events.push(e);
	
	var e = honcraft.event.create();
	e.source = 'Item_Pierce';
	e.onEquip = function(args) { 
		args.applyState = 'State_Item3B';
		args.addTargetArmor = -6;	
		args.assumption = 'Target is affected by -6 from Shieldbreaker.';
	};
	events.push(e);
	
	var e = honcraft.event.create();
	e.source = 'Item_ElderParasite';
	e.onEquip = function(args) { 
		args.applyState = 'State_Item3B';
		args.addAttackSpeed = 1;	
		args.assumption = 'Elder parasite is active.';
	};
	events.push(e);
	
	var e = honcraft.event.create();
	e.source = 'Item_HarkonsBlade';
	e.onPreAttackImpact = function(args) { 
		args.applyState = 'State_HarkonsBlade';
		args.addTargetMagicArmor = -5;	
		args.convertToMagicDamage = true;
		args.assumption = 'Harkon\'s blade is active.';
	};
	events.push(e);
	
    var e = honcraft.event.create();
	e.source = 'Item_Silence';
	e.onEquip = function(args) { 
		args.applyState = 'State_Hellflower';
		args.damageAmplification = .2;	
		args.assumption = 'Target is affected by Hellflower (20% damage increase).';
	};
	events.push(e);

    // Heroes.
    var e = honcraft.event.create();
	e.source = 'Hero_Scout';
	e.onCreated = function(args) { 
        this.critModifier = {
            criticalChance: .5,
            criticalMultiplier: 2
        }		
		this.assumption = 'Scout has level 4 Disarm. Bonus attack speed from vanish is not calculated.';
	};
	events.push(e);
    
    
    
    
    
	honcraft.event.load(events);
	
})();
