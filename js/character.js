class Resolvable {
	constructor(array, finder){
		this.array = array;
		this.finder = finder;
		this.name_text = null;
	}

	set name(val) {
		//Colons for custom data (fields etc)
		let colonated = val.indexOf(":");
		if(colonated >= 0){
			this.name_text = val.substring(0, colonated);
			this.name_extra = val.substring(colonated);
		} else {
			this.name_text = val;
			this.name_extra = "";
		}

		this.resolve(val);
	}

	get name() {
		return this.name_text + this.name_extra;
	}

	resolve(val) {
		this.source = this.array.find((el) => {
			return this.finder(el);
		});
	}
	
	serialize(){
		let out = {};
		this.__proto__.constructor.serial_values.forEach( (key) => {
			out[key] = this[key];
		});
		return out;
	}

	static deserialize(obj,hint){
		let inst = new hint();
		this.serial_values.forEach(function(key){
			inst[key] = obj[key];
		});
		return inst;
	}

}
Resolvable.serial_values = ["name"];

class InvItem extends Resolvable {
	constructor(name,filtercategory) {
		super(unsorted_gear,function(item){
			if(filtercategory && (filtercategory != item.category)){
				return false;
			}
			return item.name == this.name_text;
		});

		
		this.quantity = 1;
		this.blueprint = false;
		this.mods = [];
		
		this.name = name || "<Input Item Name>";

		if(!this.source){
			this.restricted = false;
			this.summary = "<Input Item Summary>";
		}
	}

	resolve(val) {
		super.resolve(val);
		
		if(this.source) {
			this.id = this.source.id;
			this.summary = this.source.summary;
			if('complexity/gp' in this.source) {
				this.restricted = this.source['complexity/gp'].indexOf("R") >= 0 ? true : false;
				this.gearpoints = this.source['complexity/gp'].match(/.$/g);
			}
		} else {
			this.source = null;
			this.id = null;
		}
	}
}
InvItem.serial_values = ["name","quantity","blueprint","mods","restricted","summary"];

class InvArmor extends InvItem {
	constructor(name,filtercategory){
		super(name,filtercategory);

		this.kinetic = 0;
		this.energy = 0;
		this.notes = "";
	}

	resolve(val) {
		super.resolve(val);
		if(this.source) {
			this.notes = this.source.notes;
			this.kinetic = this.source.kinetic;
			this.energy = this.source.energy;
		}
	}
}
InvArmor.serial_values = ["name","kinetic","energy","notes","mods"];

class InvWep extends InvItem {
	constructor(name,filtercategory) {
		super(name,filtercategory);
		
		if(!this.source) {
			this.damage = "0d10";
			this.notes = null;
		}
	}
	resolve(val) {
		super.resolve(val);
		if(this.source){
			this.damage = this.source.damage;
			this.notes = this.source.notes;
		}
	}
}
InvWep.serial_values = ["name","damage","notes"];

class InvRangedWep extends InvWep {
	constructor(name,filtercategory) {
		super(name,filtercategory);

		this.firemodes = "";
		this.ammo = 0;
		this.range = 0;
	}

	resolve(val) {
		super.resolve(val);

		if(this.source) {
			this.firemodes = this.source.firemodes;
			this.ammo = this.source.ammo;
			this.range = this.source.range;
		}
	}
}
InvRangedWep.serial_values = ["name","damage","firemodes","ammo","range","notes"];

class InvWare extends InvItem {
	constructor(name) {
		super(name);

		this.type = "<Bio,Cyber,etc?>"
	}

	resolve(val) {
		super.resolve(val);

		if(this.source){
			this.typelist = `
				<p>Available as:</p>
				<ul>
					<li>Bioware: ${this.source.bioware}</li>
    				<li>Cyberware: ${this.source.cyberware}</li>
    				<li>Hardware: ${this.source.hardware}</li>
    				<li>Meshware: ${this.source.meshware}</li>
    				<li>Nanoware: ${this.source.nanoware}</li>
    			</ul>
			`;
		} else {
			this.typelist = null;
		}
	}
}
InvWare.serial_values = ["name","type","restricted","summary"];

class Skill extends Resolvable {
	constructor(name,aptitude,rank,mod,mandatory,specializations) {
		super(skills,function(skill){
			//Stupid skill names
			let colonated = skill.name.indexOf(":");
			if(colonated >= 0){
				return skill.name.substring(0,colonated) == this.name_text;
			}
			return skill.name == this.name_text;
		});
		
		this.aptitude = aptitude || "<Aptitude>";
		this.rank = rank || 0;
		this.mod = mod || 0;
		this.mandatory = !!mandatory;
		this.specializations = specializations || [];
		this.name = name || "<Skill Name>";

	}

	total(apt) {
		if(this.name == "Fray" || this.name == "Perceive"){apt *= 2;} //So silly
		return this.rank + this.mod + apt;
	}

	resolve(val) {
		super.resolve(val);
		if(this.source){
			this.id = this.source.id;
			let found_apt = aptitudes.find((apt) => {
				return apt.name == this.source.aptitude.toLowerCase();
			});
			if(found_apt){
				this.aptitude = found_apt.short_name;
			}
		}
		else{this.id = null;}
	}
}
Skill.serial_values = ["name","aptitude","rank","mod","mandatory","specializations"];

class Trait extends Resolvable {
	constructor(name,type,level,summary){
		super(traits,function(trait){
			return trait.name == this.name_text;
		});

		this.level = level || 0;
		this.type = type || "Positive";
		this.summary = summary || "<Input Trait Summary>";
		this.name = name || "<Input Trait Name>";
	}

	resolve(val){
		super.resolve(val);
			
		if(this.source) {
			this.id = this.source.id;
			this.summary = this.source.summary;
			this.type = this.source.type;
		} else {
			this.id = null;
		}
	}
}
Trait.serial_values = ["name","level","type","summary"];

class Sleight extends Resolvable {
	constructor(name,level,action,duration,summary) {
		super(sleights,function(sleight){
			return sleight.name == this.name_text;
		});

		this.name = name || "<Sleight Name>";
		if(!this.source) { //Safe to assume setting the name didn't find anything for us.
			this.level = "<Input Level>";
			this.action = "<Input Action>";
			this.duration = "<Input Duration>";
			this.summary = "<Input Summary>";
		}
	}

	resolve(val) {
		super.resolve(val);
		if(this.source) {
			this.id = this.source.id;
			this.level = this.source.level;
			this.action = this.source.action;
			this.duration = this.source.duration;
			this.summary = this.source.summary;
		} else {
			this.id = null;
		}
	}
}
Sleight.serial_values = ["name","level","action","duration","summary"];

class InvBot extends InvItem {
	constructor(name) {
		super(name);

		this.name = name || "<Input Name>";
		if(!this.source) {
			this.vigor = 0;
			this.vigor_max = 0;
			this.flex = 0;
			this.flex_max = 0;
			this.armor_kinetic = 0;
			this.armor_energy = 0;
			this.wound_threshold = 0;
			this.durability = 0;
			this.death_rating = 0;
			this.size = "M";
			this.movement_rate = [];
			this.ware = [];
		}
	}

	resolve(val) {
		super.resolve(val);

		if(this.source && !this.durability){ //We'll consider 0 dura as 'not configured'
			//Armors
			this.armor_energy = this.source.armor_energy;
			this.armor_kinetic = this.source.armor_kinetic;
			//Max vigors
			this.vigor_max = this.source.vigor + this.source.vigor2 ? this.source.vigor2 : 0;
			this.flex_max = this.source.flex;
			//Just set to max for now
			this.vigor = this.vigor_max;
			this.flex = this.flex_max;
			//Health stuff
			this.durability = this.source.durability;
			this.wound_threshold = this.source.wound_threshold;
			this.death_rating = this.source.death_rating;
			//Size
			this.size = this.source.size;
			//Movements
			this.movement_rate = [];
			this.source.movement_rate.forEach((move) => {
				this.movement_rate.push($.extend(true,{},move));
			});
			//Wares
			this.ware = [];
			this.source.ware.forEach((warename) => {
				this.ware.push(new InvWare(warename));
			});
		}
	}


	serialize(){
		let out = super.serialize();
		out.ware = [];
		this.ware.forEach((wareinst) => {
			out.ware.push(wareinst.serialize());
		});
		return out;
	}

	static deserialize(obj,hint){
		let inst = super.deserialize(obj,hint);
		inst.ware = [];
		obj.ware.forEach((wareflat) => {
			inst.ware.push(InvWare.deserialize(wareflat,InvWare));
		});
		return inst;
	}

}
InvBot.serial_values = [
"name","type","vigor","vigor_max","flex",
"flex_max","armor_energy","armor_kinetic","wound_threshold",
"durability","death_rating","size","movement_rate"]; //We do this.ware in our own serialize/deserialize

class InvVehicle extends InvBot { //They're like two vars apart.
	constructor(name){
		super(name);

		if(!this.source) {
			this.passengers = 0;
		}
	}

	resolve(val){
		super.resolve(val);

		if(this.source && !this.durability) { //We'll consider 0 dura as 'not configured'
			this.passengers = this.source.passengers;
		}
	}
}
InvVehicle.serial_values = [
"name","type","vigor","vigor_max","flex","passengers",
"flex_max","armor_energy","armor_kinetic","wound_threshold",
"durability","death_rating","size","movement_rate"]; //We do this.ware in our own serialize/deserialize

// // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // The Character Object // // // // // // // // //
// // // // // // // // // // // // // // // // // // // // // // // // // 

var character_loaded = null;

class Character {
	constructor() {
		//2: Corrected missing class hints
		//3: Added muse name/looks
		this.version = 3;
		//Basic vitals
		this.name = "<Input Name>";
		this.aliases = "<Input Aliases>";
		this.motivations = "<Input Motivations>";
		this.languages = "<Input Languages>";
		this.gender = "<Input Gender>";
		this.active_forks = "<Input Forks>";
		this.sex = "<Input Sex>";
		this.age = 0;
		this.notes = "<Input Notes>";

		// Muse! A muse object
		this.muse = {
			name: "<Muse Name>",
			looks: "<Muse Appearance>",
			cog_base: 10,
			int_base: 15,
			ref_base: 10,
			sav_base: 10,
			som_base: 10,
			wil_base: 10,

			set cog(val) {
				this.cog_base = val;
			},
			set int(val) {
				this.int_base = val;
			},
			set ref(val) {
				this.ref_base = val;
			},
			set sav(val) {
				this.sav_base = val;
			},
			set som(val) {
				this.som_base = val;
			},
			set wil(val) {
				this.wil_base = val;
			},

			get cog() {
				return this.cog_base;
			},
			get int() {
				return this.int_base;
			},
			get ref() {
				return this.ref_base;
			},
			get sav() {
				return this.sav_base;
			},
			get som() {
				return this.som_base;
			},
			get wil() {
				return this.wil_base;
			},

			get COG() {
				return this.cog;
			},
			get INT() {
				return this.int;
			},
			get REF() {
				return this.ref;
			},
			get SAV() {
				return this.sav;
			},
			get SOM() {
				return this.som;
			},
			get WIL() {
				return this.wil;
			},

			get cog_check() {
				return (this.cog_base) * 3;
			},
			get int_check() {
				return (this.int_base) * 3;
			},
			get ref_check() {
				return (this.ref_base) * 3;
			},
			get sav_check() {
				return (this.sav_base) * 3;
			},
			get som_check() {
				return (this.som_base) * 3;
			},
			get wil_check() {
				return (this.wil_base) * 3;
			},

			skills: [],

			initiative: 5,

			lucidity: 20,
			trauma_threshold: 4,
			insanity_rating: 40,
			stress_taken: 0,
			traumas_taken: 0,

			//For when Muses are on the mesh
			wound_threshold: 4,
			durability: 20,
			death_rating: 40,
			damage_taken: 0,
			wounds_taken: 0
		};

		// Traits are somewhat isolated from chargen
		this.ego_traits = [];

		// Chargen packages, stored by their UUID
		this.background_obj = null;
		this.background_name = "<Input Background>";

		this.career_obj = null;
		this.career_name = "<Input Career>";

		this.interest_obj = null;
		this.interest_name = "<Input Interest>";

		this.faction_obj = null;
		this.faction_name = "<Input Faction>";

		// Pool stuff
		this.insight = 0;
		this.moxie = 0;
		this.vigor = 0;
		this.flex_ego = 0;
		this.flex_morph = 0;

		this.insight_left = 0;
		this.moxie_left = 0;
		this.vigor_left = 0;
		this.flex_left = 0;

		this.shortrests = 2;
		this.shortrests_left = 2;
		this.longrest_used = false;

		// Damage stuff
		this.durability_base = 0; //Defined by morph
		this.durability_mod = 0;

		this.wound_threshold_mod = 0;

		this.death_rating_mod = 0;

		this.lucidity_mod = 0;
		this.trauma_threshold_mod = 0;
		this.insanity_rating_mod = 0;

		this.damage_taken = 0;
		this.stress_taken = 0;

		this.wounds_taken = 0;
		this.traumas_taken = 0;

		// Random mechanical stuff
		this.initiative_mod = 0;

		this.morph_name = "<Input Morph Name>";
		this.morph_type = "Biomorph";
		this.morph_bio = true; // True for biological morphs, false for all others (synth, info, flex, etc)
		this.morph_mp_cost = 0;
		this.morph_avail = 0;
		this.morph_size = "Normal";
		this.movement_rate = []; // Special format, see morphs
		this.ware = []; // List of objects
		this.morph_traits = []; // List of objects
		this.morph_notes = "<Input Morph Notes>";

		this.ongoing_effects = []; // List of strings
		this.mental_edits = []; // List of strings
		this.last_backup_content = "<Last Backup Content>";
		this.last_backup_time = "<Last Backup Time>";
		this.last_backup_location = "<Last Backup Location>";

		// XP 
		this.rez_spent = 0;
		this.rez_unspent = 0;

		// Reputation
		this.rep_real = {
			a_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			c_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			f_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			g_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			i_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			r_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			x_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			}
		};
		this.rep_fake1 = {
			name: "<Fake Name Here>",
			a_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			c_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			f_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			g_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			i_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			r_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			x_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			}
		};
		this.rep_fake2 = {
			name: "<Fake Name Here>",
			a_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			c_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			f_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			g_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			i_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			r_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			},
			x_rep: {
				value: 0,
				min_favors: 0,
				mod_favors: 0,
				maj_favors: 0
			}
		};

		// Aptitudes
		this.cog_base = 0;
		this.int_base = 0;
		this.ref_base = 0;
		this.sav_base = 0;
		this.som_base = 0;
		this.wil_base = 0;

		this.cog_mod = 0;
		this.int_mod = 0;
		this.ref_mod = 0;
		this.sav_mod = 0;
		this.som_mod = 0;
		this.wil_mod = 0;

		this.cog_check_premod = 0;
		this.int_check_premod = 0;
		this.ref_check_premod = 0;
		this.sav_check_premod = 0;
		this.som_check_premod = 0;
		this.wil_check_premod = 0;

		this.cog_check_postmod = 0;
		this.int_check_postmod = 0;
		this.ref_check_postmod = 0;
		this.sav_check_postmod = 0;
		this.som_check_postmod = 0;
		this.wil_check_postmod = 0;

		// Our skills
		this.skills = [];

		// Async stuff (as in psionics, not as in async web technologies)
		this.substrain = "<Input Substrain>";
		this.infection_rating = 0;
		this.influence_events = [{
			event: "Physical Damage, Take DV 1d6"
		}];
		this.sleights = [];

		// Inventory/gear/possessions
		this.weapons_ranged = []; // List of objects
		this.weapons_melee = []; // List of objects
		this.items = []; // List of objects
		this.bots = []; // List of objects
		this.vehicles = []; // List of objects
		this.armors = [];
	}

	shortrest() {
		if (this.shortrests_left === 0) {
			this.shortrests_left = this.shortrests;
		} else {
			this.shortrests_left--;

			let roll = Math.floor((Math.random() * 6)+1);

			$('body')
	          .toast({
	            title: 'I rolled a d6 for your short rest:',
	            message: "It landed on " + String(roll),
	            displayTime: 7000,
	            showProgress: "bottom"
	        });
		}
	}

	longrest() {
		this.longrest_used = !this.longrest_used;
		if(this.longrest_used){ //As in, we just used it.
			this.insight_left = this.insight;
			this.moxie_left = this.moxie;
			this.vigor_left = this.vigor;
			this.flex_left = this.flex;
		}
	}

	get durability() {
		return this.durability_base + this.durability_mod;
	}

	set durability(val) {
		this.durability_base = val;
	}

	get wound_threshold() {
		return Math.round((this.durability / 5) + this.wound_threshold_mod);
	}

	get death_rating() {
		return Math.round(this.morph_bio ? ((this.durability * 1.5) + this.death_rating_mod) : ((this.durability * 2) + this.death_rating_mod));
	}

	get lucidity() {
		return Math.round((this.wil * 2) + this.lucidity_mod);
	}

	get trauma_threshold() {
		return Math.round((this.lucidity / 5) + this.trauma_threshold_mod);
	}

	get insanity_rating() {
		return Math.round((this.lucidity * 2) + this.insanity_rating_mod);
	}
	get initiative() {
		return Math.round((this.ref + this.int) / 5);
	}

	get flex() {
		return this.flex_ego + this.flex_morph;
	}

	set background(typed) {
		let found = backgrounds.find((el) => {
			return el.name == typed;
		});
		if (found) {
			this.background_obj = found;
		} else {
			this.background_obj = null;
		}

		this.background_name = typed;
	}
	get background() {
		return this.background_name;
	}
	set career(typed) {
		let found = careers.find((el) => {
			return el.name == typed;
		});
		if (found) {
			this.career_obj = found;
		} else {
			this.career_obj = null;
		}

		this.career_name = typed;
	}
	get career() {
		return this.career_name;
	}
	set interest(typed) {
		let found = interests.find((el) => {
			return el.name == typed;
		});
		if (found) {
			this.interest_obj = found;
		} else {
			this.interest_obj = null;
		}

		this.interest_name = typed;
	}
	get interest() {
		return this.interest_name;
	}
	set faction(typed) {
		let found = factions.find((el) => {
			return el.name == typed;
		});
		if (found) {
			this.faction_obj = found;
		} else {
			this.faction_obj = null;
		}

		this.faction_name = typed;
	}
	get faction() {
		return this.faction_name;
	}

	set cog(val) {
		this.cog_base = val;
	}
	set int(val) {
		this.int_base = val;
	}
	set ref(val) {
		this.ref_base = val;
	}
	set sav(val) {
		this.sav_base = val;
	}
	set som(val) {
		this.som_base = val;
	}
	set wil(val) {
		this.wil_base = val;
	}

	get cog() {
		return this.cog_base + this.cog_mod;
	}
	get int() {
		return this.int_base + this.int_mod;
	}
	get ref() {
		return this.ref_base + this.ref_mod;
	}
	get sav() {
		return this.sav_base + this.sav_mod;
	}
	get som() {
		return this.som_base + this.som_mod;
	}
	get wil() {
		return this.wil_base + this.wil_mod;
	}

	//LISTEN. LISTEN. It's FINE.
	get COG() {
		return this.cog;
	}
	get INT() {
		return this.int;
	}
	get REF() {
		return this.ref;
	}
	get SAV() {
		return this.sav;
	}
	get SOM() {
		return this.som;
	}
	get WIL() {
		return this.wil;
	}

	get cog_check() {
		return (this.cog_base + this.cog_mod + this.cog_check_premod) * 3 + this.cog_check_postmod;
	}
	get int_check() {
		return (this.int_base + this.int_mod + this.int_check_premod) * 3 + this.int_check_postmod;
	}
	get ref_check() {
		return (this.ref_base + this.ref_mod + this.ref_check_premod) * 3 + this.ref_check_postmod;
	}
	get sav_check() {
		return (this.sav_base + this.sav_mod + this.sav_check_premod) * 3 + this.sav_check_postmod;
	}
	get som_check() {
		return (this.som_base + this.som_mod + this.som_check_premod) * 3 + this.som_check_postmod;
	}
	get wil_check() {
		return (this.wil_base + this.wil_mod + this.wil_check_premod) * 3 + this.wil_check_postmod;
	}

	increase_skill(skillname,amt,fieldhint){
		let existing = this.skills.find( (skill) => {
			return skill.name.toLowerCase() == skillname.toLowerCase();
		});
		if(existing) {
			existing.rank += amt;
		} else {
			let skillbase = find_by_name(skills,skillname);
			if(skillbase && skillbase.field){
				skillname += ": " + fieldhint;
			}
			
			let newskill = new Skill(skillname.toTitleCase(),null);
			newskill.rank = amt; //We set it after so constructor/resolve() in skill has a chance to run.
			this.skills.push(newskill);
		}
	}
	decrease_skill(skillname,amt){
		let existing = this.skills.find( (skill) => {
			return skill.name.toLowerCase() == skillname.toLowerCase();
		});
		if(existing) {
			existing.rank -= amt;
		} else {
			return; //Can't decrease imaginary skills!
		}
	}

	add_to(location,item,message){
		//What character?
		if(!character_loaded) {
			show_toast("Open your character sheet once first!","Just click the tab to load a charcter.","warning");
			return;
		}

		//Let's try it.
		try {
			if(Array.isArray(this[location])){
				this[location].push(item);
			} else {
				this[location] = item;
			}

			show_toast("Added to Character!",message,"success");

		} catch (e) {
			console.error(e);
			show_toast("Operation Failed!","I couldn't add that to your sheet, sorry!","error");
		}
	}
}

var serial_character = {
	version: null,
	name: null,
	aliases: null,
	motivations: null,
	languages: null,
	gender: null,
	active_forks: null,
	sex: null,
	age: null,
	notes: null,
	muse: {
		name: null,
		looks: null,
		cog_base: null,
		int_base: null,
		ref_base: null,
		sav_base: null,
		som_base: null,
		wil_base: null,
		skills: [Skill],
		initiative: null,
		lucidity: null,
		trauma_threshold: null,
		insanity_rating: null,
		stress_taken: null,
		traumas_taken: null,
		wound_threshold: null,
		durability: null,
		death_rating: null,
		damage_taken: null,
		wounds_taken: null,
	},
	ego_traits: [Trait],
	background_obj: null,
	background_name: null,
	career_obj: null,
	career_name: null,
	interest_obj: null,
	interest_name: null,
	faction_obj: null,
	faction_name: null,
	insight: null,
	moxie: null,
	vigor: null,
	flex_ego: null,
	flex_morph: null,
	insight_left: null,
	moxie_left: null,
	vigor_left: null,
	flex_left: null,
	shortrests: null,
	shortrests_left: null,
	longrest_used: null,
	durability_base: null,
	durability_mod: null,
	wound_threshold_mod: null,
	death_rating_mod: null,
	lucidity_mod: null,
	trauma_threshold_mod: null,
	insanity_rating_mod: null,
	damage_taken: null,
	stress_taken: null,
	wounds_taken: null,
	traumas_taken: null,
	initiative_mod: null,
	morph_name: null,
	morph_type: null,
	morph_bio: null,
	morph_mp_cost: null,
	morph_avail: null,
	morph_size: null,
	movement_rate: [],
	ware: [InvWare],
	morph_traits: [Trait],
	morph_notes: null,
	ongoing_effects: null,
	mental_edits: null,
	last_backup_content: null,
	last_backup_time: null,
	last_backup_location: null,
	rez_spent: null,
	rez_unspent: null,
	rep_real: {
		a_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		c_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		f_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		g_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		i_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		r_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		x_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		}
	},
	rep_fake1: {
		name: null,
		a_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		c_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		f_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		g_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		i_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		r_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		x_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		}
	},
	rep_fake2: {
		name: null,
		a_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		c_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		f_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		g_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		i_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		r_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		},
		x_rep: {
			value: null,
			min_favors: null,
			mod_favors: null,
			maj_favors: null,
		}
	},
	cog_base: null,
	int_base: null,
	ref_base: null,
	sav_base: null,
	som_base: null,
	wil_base: null,
	cog_mod: null,
	int_mod: null,
	ref_mod: null,
	sav_mod: null,
	som_mod: null,
	wil_mod: null,
	cog_check_premod: null,
	int_check_premod: null,
	ref_check_premod: null,
	sav_check_premod: null,
	som_check_premod: null,
	wil_check_premod: null,
	cog_check_postmod: null,
	int_check_postmod: null,
	ref_check_postmod: null,
	sav_check_postmod: null,
	som_check_postmod: null,
	wil_check_postmod: null,
	skills: [Skill],
	substrain: null,
	infection_rating: null,
	influence_events: [],
	sleights: [Sleight],
	weapons_ranged: [InvWep],
	weapons_melee: [InvRangedWep],
	items: [InvItem],
	bots: [InvBot],
	vehicles: [InvVehicle],
	armors: [InvArmor]
}