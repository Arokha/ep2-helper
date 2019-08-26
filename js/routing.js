Vue.use(VueRouter);

const vr_quickrules = function() {
	return $.ajax("static/quickrules.html").then(function(templateHtml) {
		return {template: templateHtml};
	});
};

const vr_roller = {
	template: `
		<div class="ui segment inverted">
			<p><span class="ui big text">Results: <span id="result-zone"></span></span></p>
			<div class="big ui right labeled button" tabindex="0">
		  	<div id="roll-dice" class="ui button"><i class="redo icon"></i> Roll</div>
		  	<div id="roll-result" class="ui basic left pointing label">00</div>
			</div>
			<br>
			<br>
			<div>
				<p><label for="roll-target">Roll Target:&nbsp;&nbsp;</label>
				<input type="number" id="roll-target" name="roll-target" min="0" max="200"></p>
			</div>
		</div>
	`,
	mounted: function() {
		$("#roll-dice").click(() => {roll_dice();});

		function roll_dice(){
			var real_result = Math.floor(Math.random() * 100); //Just a normal d100 roll, from 00-99.
			var result = real_result;

			//Modifier shenanigans in here

			$("#roll-result").text(result);
			bonus_update(real_result);
		}

		function bonus_update(roll){
			var bonus = "";
			var target_number = Number($("#roll-target").val());
			$("#roll-dice").timedDisable(1000);

			//"Superiors"
			if(target_number){
				//Success
				if((roll >= 66) && (roll <= target_number)){bonus = "Two Superior Successes!";} else
				if((roll >= 33) && (roll <= target_number)){bonus = "One Superior Success!";} else
				//Failure
				if((roll <= 33) && (roll > target_number)){bonus = "Two Superior Failures!";} else
				if((roll <= 66) && (roll > target_number)){bonus = "One Superior Failure!";}
			}

			//Criticals
			if(roll == 0){bonus = "Critical Success!";} else
			if(roll == 99){bonus = "Critical Failure!";} else
			if((roll % 11) == 0){
				if(target_number){
					if(roll <= target_number){bonus = "Critical Success!";} else {bonus = "Critical Failure!";}
				} else {
					bonus = "Critical Result!";
				}
			}
		
			if(bonus){
				$("#result-zone").addClass("rainbow-text");
				$("#result-zone").html(bonus);
			} else {
				$("#result-zone").removeClass("rainbow-text");
				if(target_number && (roll <= target_number)){
					$("#result-zone").html("Success!");
				} else if(target_number){
					$("#result-zone").html("Failure!");
				} else {
					$("#result-zone").html("");
				}
			}
		}
	}
}

const vr_chargen = { 
	template: '<ajax-tab v-on:ajaxupdated="innerupdate()" path="static/chargen.html"></ajax-tab>',
	methods: {
		innerupdate: function(){
			var vue_chargen = new Vue({
		    el: '#chargen-grid',
		    data: {
		      chargen: [],
		      backgrounds: [],
		      careers: [],
		      interests: [],
		      factions: [],
		      aptemps: [],
		      reputations: [],
		      gearpacks: []
		    },
		    methods: {
		      or_list: function (arr) {
		        return arr.join(", ").replace(/, ((?:.(?!, ))+)$/, ', or $1');
		      }
		    }
		  });

		  $.getJSON('data/chargen.json').then(function(json){vue_chargen.chargen = json;});
		  $.getJSON('data/backgrounds.json').then(function(json){vue_chargen.backgrounds = json;});
		  $.getJSON('data/careers.json').then(function(json){vue_chargen.careers = json;});
		  $.getJSON('data/interests.json').then(function(json){vue_chargen.interests = json;});
		  $.getJSON('data/factions.json').then(function(json){vue_chargen.factions = json;});
		  $.getJSON('data/aptitude_templates.json').then(function(json){vue_chargen.aptemps = json;});
		  $.getJSON('data/reputations.json').then(function(json){vue_chargen.reputations = json;});
		  $.getJSON('data/gear_packs.json').then(function(json){vue_chargen.gearpacks = json;});
		}
	}
}

const vr_morphs = {
	data: function () {
		return {
			morphs: [],
			morph_types: []
		};
	},
	template: `
	<div class="ui segment inverted">
		<div id="morph-grid" class="ui grid">
		  <div class="two wide column">
		    <div id="morph-tabs" class="ui vertical sticky fluid tabular menu inverted">
		      <a class="item active" data-tab="morphs-1">Biomorphs</a>
		      <a class="item" data-tab="morphs-2">Pod Biomorphs</a>
		      <a class="item" data-tab="morphs-3">Uplift Biomorhs</a>
		      <a class="item" data-tab="morphs-4">Synthmorphs</a>
		      <a class="item" data-tab="morphs-5">Infomorphs</a>
		    </div>
		  </div>
		  <div class="fourteen wide stretched column">
			<vcomp-typecard :morphs="morphs" :morph_types="morph_types" idappend="1" :active="true" mytype="Biomorph"></vcomp-typecard>
			<vcomp-typecard :morphs="morphs" :morph_types="morph_types" idappend="2" mytype="Pod"></vcomp-typecard>
			<vcomp-typecard :morphs="morphs" :morph_types="morph_types" idappend="3" mytype="Uplift"></vcomp-typecard>
			<vcomp-typecard :morphs="morphs" :morph_types="morph_types" idappend="4" mytype="Synthmorph"></vcomp-typecard>
			<vcomp-typecard :morphs="morphs" :morph_types="morph_types" idappend="5" mytype="Infomorph"></vcomp-typecard>
		  </div>
		</div>
	</div>
	`,
	created: function() {
		$.getJSON('data/morphs.json').then( (json) => {
			this.morphs = json;
		});
		$.getJSON('data/morph_types.json').then( (json) => {
			this.morph_types = json;
		});
	},
	mounted: function() {
		$('.item', this.$el).tab({
  			onVisible: function(){
		    	$(".sticky", this.$el).sticky('refresh');
  			}
		});
	},
	computed: {
		biomorphs: function () {
		  return this.morphs.filter(function(element){
		    if(element.type == "Biomorph"){return true;}
		  });
		},
		pod_biomorphs: function () {
		  return this.morphs.filter(function(element){
		    if(element.type == "Pod"){return true;}
		  });
		},
		uplift_biomorphs: function () {
		  return this.morphs.filter(function(element){
		    if(element.type == "Uplift"){return true;}
		  });
		},
		synthmorphs: function () {
		  return this.morphs.filter(function(element){
		    if(element.type == "Synthmorph"){return true;}
		  });
		},
		infomorphs: function () {
		  return this.morphs.filter(function(element){
		    if(element.type == "Infomorph"){return true;}
		  });
		},
		flexbot_parts: function () {
		  return this.morphs.filter(function(element){
		    if(element.type == "Flexbot Part"){return true;}
		  });
		}
	}
}
const vr_gear = {
	data: function() {
		return {
			unsorted_gear: [],
			gear_types: {}
		};
	},
	template: `
	<div class="ui segment inverted">
		<div id="gear-grid" class="ui grid">
		  <div class="two wide column">
		    <div id="gear-tabs" class="ui vertical sticky fluid tabular menu inverted">
		       <vcomp-gear-tab v-for="(catobj,catname) in categories" :category="catobj" :categoryname="catname" :key="catname"></vcomp-gear-tab>
		    </div>
		  </div>
		  <div class="fourteen wide stretched column">
		  	<vcomp-gear-section v-for="(catobj,catname) in categories" :category="catobj" :categoryname="catname" :key="catname"></vcomp-gear-section>
		  </div>
		</div>
	</div>
	`,
	created: function() {
		var gear_jsons = [
			"gear_bots.json",
			"gear_comms.json",
			"gear_creatures.json",
			"gear_drugs.json",
			"gear_items.json",
			"gear_mission.json",
			"gear_nano.json",
			"gear_security.json",
			"gear_software.json",
			"gear_swarms.json",
			"gear_vehicles.json",
			"gear_ware.json",
			"services.json",
			"weapons_melee.json",
			"weapons_ranged.json",
			"weapons_ammo.json",
			"gear_armor.json"
		];

		gear_jsons.forEach( (file) => {
			$.getJSON('data/'+file).then( (json) => {
				this.unsorted_gear.push.apply(this.unsorted_gear,json);
			});
		});

		$.getJSON('data/gear_text.json').then( (json) => {
			this.gear_types = json;
		});
	},
	mounted: function() {
		$('.item', this.$el).tab({
  			onVisible: function(){
		    	$(".sticky", this.$el).sticky('refresh');
  			}
		});
	},	
	computed: {
		categories: function() {
			let new_cats = {};

			//Iterate over what should be a rapidly shrinking list
			this.unsorted_gear.forEach(function(item_object){
				//What category is our contender?
				let category = item_object.category;
				
				//We already have that one though
				if(category in new_cats){return;}
				
				//Make our new object
				let new_category = {
					"text":"",
					"subcategories":{}
				};

				//Grab the text if it exists
				if(category in this.gear_types){
					if('text' in this.gear_types[category]){
						new_category.text = this.gear_types[category]['text'];
					}
				}
				
				//Get all my items
				let this_category = this.unsorted_gear.filter(function(maybe_mine,index){
						return maybe_mine.category == category;
				},this);

				//I wish I had subcategories
				this_category.forEach(function(my_item){
					let subcategory = my_item.subcategory;
					
					//Oh you already know I exist okay then
					if(subcategory in new_category.subcategories){
						new_category['subcategories'][subcategory].items.push(my_item);
						return; //Ok added bye
					}
					
					//Oh a first timer
					let new_subcategory = {
						"text":"",
						"items":[],
						"columns":["name"]
					};
					new_subcategory.items.push(my_item); //Hi I'm the first
					
					//Grab the text if it exists
					if(category in this.gear_types){
						if(subcategory in this.gear_types[category]['subcategories']){
							if('text' in this.gear_types[category]['subcategories'][subcategory]){
	  						new_subcategory.text = this.gear_types[category]['subcategories'][subcategory]['text'];
							}
						}
					}

					//Surely there's a better way...
					if(category in this.gear_types){
						if(subcategory in this.gear_types[category]['subcategories']){
							if('columns' in this.gear_types[category]['subcategories'][subcategory]){
	  						new_subcategory.columns = this.gear_types[category]['subcategories'][subcategory]['columns'];
							}
						}
					}

					new_category['subcategories'][subcategory] = new_subcategory;
				},this);
				new_cats[category] = new_category;
			},this);
			//Done!
			return new_cats;
		}
	}
}

const vr_traits = {
	data: function() {
		return {
			traits: []
		};
	},
	template: `
	<div class="ui segment inverted">	
		<div id="traits-grid" class="ui grid">
		  <div class="two wide column">
		    <div id="traits-tabs" class="ui vertical sticky fluid tabular menu inverted">
				<a class="item" data-tab="traits-positive">Positive</a>
				<a class="item" data-tab="traits-negative">Negative</a>
		    </div>
		  </div>
		  <div class="fourteen wide stretched column">
			 <div class="ui tab segment inverted" id="traits-positive" data-tab="traits-positive">
				<vcomp-trait-table :traits="traits_positive"></vcomp-trait-table>
			 </div>
			 <div class="ui tab segment inverted" id="traits-negative" data-tab="traits-negative">
				<vcomp-trait-table :traits="traits_negative"></vcomp-trait-table>
			 </div>
		  </div>
		</div>
	</div>
	`,
	created: function() {
		$.getJSON('data/traits.json').then( (json) => {
			this.traits = json;
		});
	},
	mounted: function() {
		$('.item', this.$el).tab({
  			onVisible: function(){
		    	$(".sticky", this.$el).sticky('refresh');
  			}
		});
	},	
	computed: {
		traits_positive: function () {
	  		return this.traits.filter(function(element){
		    	if(element.type == "Positive"){return true;}
	  		});
		},
		traits_negative: function () {
	  		return this.traits.filter(function(element){
	  			if(element.type == "Negative"){return true;}
	  		});
		}
	}
}

const vr_routes = [
  { path: '*', redirect: '/quickrules' },
  { path: '/quickrules', component: vr_quickrules },
  { path: '/roller', component: vr_roller },
  { path: '/chargen', component: vr_chargen },
  { path: '/morphs', component: vr_morphs },
  { path: '/gear', component: vr_gear },
  { path: '/traits', component: vr_traits }
]

const vr_router = new VueRouter({
  routes: vr_routes,
  linkActiveClass: "active"
})
