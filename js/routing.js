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

const vr_chargen = function() {
  return $.ajax("static/chargen.html").then(function(templateHtml) {
    return {
      template: templateHtml,
      data: function() {
        return {
          chargen: [],
          backgrounds: [],
          careers: [],
          interests: [],
          factions: [],
          aptemps: [],
          reputations: [],
          gearpacks: [],
          skills: []
        };
      },
      methods: {
        or_list: function (arr) {
        return arr.join(", ").replace(/, ((?:.(?!, ))+)$/, ', or $1');
        }
      },
      watch: {
        '$route' (to, from) {
          // Handle the showing & hiding of the target segment!
          $(this.$el).find("#chargen-" + from.params.step).removeClass("active");
          $(this.$el).find("#chargen-" + to.params.step).addClass("active");
          $(".sticky", this.$el).sticky('refresh');
        }
      },
      updated: function () {
        $(this.$el).find('table').tablesort();
      },
      mounted: function(){
        // Tabs are already hard coded in the template, we'e good to initialize tabs
        $(this.$el).find("#chargen-" + this.$route.params.step).addClass("active");
        
        // When all data is loaded, the active tab will be at proper height and we can refresh sticky.
        Promise.all([
          $.getJSON('data/chargen.json').then((json) => {this.chargen = json;}),
          $.getJSON('data/backgrounds.json').then((json) => {this.backgrounds = json;}),
          $.getJSON('data/careers.json').then((json) => {this.careers = json;}),
          $.getJSON('data/interests.json').then((json) => {this.interests = json;}),
          $.getJSON('data/factions.json').then((json) => {this.factions = json;}),
          $.getJSON('data/aptitude_templates.json').then((json) => {this.aptemps = json;}),
          $.getJSON('data/reputations.json').then((json) => {this.reputations = json;}),
          $.getJSON('data/gear_packs.json').then((json) => {this.gearpacks = json;}),
          $.getJSON('data/skills.json').then((json) => {this.skills = json;})
        ]).then(() => {
          Vue.nextTick(() => {
            $(".sticky", this.$el).sticky();
          });
        });
      }
    };
  });
}

const vr_morphs = {
  data: function () {
    return {
      morphs: [],
      morph_types: []
    };
  },
  props: {
    morphtype: String
  },
  template: `
  <div class="ui segment inverted">
    <div id="morph-grid" class="ui grid">
      <div class="two wide column">
        <div id="morph-tabs" class="ui vertical sticky fluid tabular menu inverted">
          <router-link class="item" to="biomorph">Biomorphs</router-link>
          <router-link class="item" to="pod">Pod Biomorphs</router-link>
          <router-link class="item" to="uplift">Uplift Biomorhs</router-link>
          <router-link class="item" to="synthmorph">Synthmorphs</router-link>
          <router-link class="item" to="infomorph">Infomorphs</router-link>
          <router-link class="item" to="flexbot">Flexbots</router-link>
        </div>
      </div>
      <div class="fourteen wide stretched column">
      	<vcomp-typecard :mymorphs="current_morphs" :mytype_obj="current_typeobj" mytype=""></vcomp-typecard>
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
    current_morphs: function () {
      switch(this.morphtype){
        case "biomorph":
          return this.biomorphs;
        case "pod":
          return this.pod_biomorphs;
        case "uplift":
          return this.uplift_biomorphs;
        case "synthmorph":
          return this.synthmorphs;
        case "infomorph":
          return this.infomorphs;
        case "flexbot":
          return this.flexbot_parts;
        default:
          return [];
      }
    },
    current_typeobj: function() {
      let capsname = this.morphtype.charAt(0).toUpperCase() + this.morphtype.slice(1);
      return this.morph_types.find((element) => {
        return element.name == capsname;
      });
    },
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
        if(element.type == "Flexbot"){return true;}
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
  props: {
  	category: String,
  	subcategory: String
  },
  template: `
  <div class="ui segment inverted">
    <div id="gear-grid" class="ui grid">
      <div class="two wide column">
        <div id="gear-tabs" class="ui vertical sticky fluid tabular menu inverted">
          <template v-for="(catobj,catname) in categories">
          	<router-link class="item" :to="'/gear/'+catname">
		          {{catname}}
		          <div class="menu">
			          <div class="ui divider"></div>
			          <router-link v-for="(thekey,subcatname) in catobj.subcategories" class="item" :to="'/gear/'+catname+'/'+despace(subcatname)" v-on:click.stop style="text-align: right;" :key="'link'+catname+subcatname">{{subcatname}}</router-link>
		          </div>
	          </router-link>
          </template>
        </div>
      </div>
      <div class="fourteen wide stretched column">
        <vcomp-gear-section v-if="current_category" :category="current_category" :categoryname="current_catname" :key="current_catname"></vcomp-gear-section>
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
      this.$nextTick(function (){
        $(".sticky", this.$el).sticky('refresh');
      });
  },
  watch: {
    '$route' (to, from) {
      this.$nextTick(function (){
        $(".sticky", this.$el).sticky('refresh');
      });
    }
  },
  methods: {
  	despace: function(value) {
  		return global_despace(value);
  	}
  },
  computed: {
  	current_category: function() {
  		return this.categories[this.category];
  	},
  	current_catname: function() {
  		//So, a user could just put whatever they want in this and it would get put somewhere, maybe vulnerable to attack?
  		//But presumably if we actually found the real category with this in the real json on our site, then it's
  		//probably not any kind of badness.
  		if(this.category in this.categories){
  			return this.category;
  		}
  	},
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
  props: {
    tabid: String
  },
  template: `
  <div class="ui segment inverted">  
    <div id="traits-grid" class="ui grid">
      <div class="two wide column">
        <div id="traits-tabs" class="ui vertical sticky fluid tabular menu inverted">
        <router-link class="item" to="positive">Positive</router-link>
        <router-link class="item" to="negative">Negative</router-link>
        </div>
      </div>
      <div class="fourteen wide stretched column">
      <div class="ui segment inverted">
        <vcomp-trait-table :traits="current_traits"></vcomp-trait-table>
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
    current_traits: function () {
      switch(this.tabid){
        case "positive":
          return this.traits_positive;
        case "negative":
          return this.traits_negative;
        default:
          return [];
      }
    },
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

const vr_primer = function() {
  return $.ajax("static/primer.html").then(function(templateHtml) {
    return {
      template: templateHtml,
      methods: {
        or_list: function (arr) {
        return arr.join(", ").replace(/, ((?:.(?!, ))+)$/, ', or $1');
        }
      },
      watch: {
        '$route' (to, from) {
          // Handle the showing & hiding of the target segment!
          $(this.$el).find("#primer-" + from.params.step).removeClass("active");
          $(this.$el).find("#primer-" + to.params.step).addClass("active");
          $(".sticky", this.$el).sticky('refresh');
        }
      },
      mounted: function(){
        // Tabs are already hard coded in the template, we'e good to initialize tabs
        $(this.$el).find("#primer-" + this.$route.params.step).addClass("active");
      }
    }
  });
}

const vr_routes = [
  { path: '/quickrules', component: vr_quickrules },
  { path: '/roller', component: vr_roller },
  { path: '/chargen', redirect: '/chargen/1' },
  { path: '/chargen/:step', component: vr_chargen },
  { path: '/primer', redirect: '/primer/whatis' },
  { path: '/primer/:step', component: vr_primer },
  { path: '/morphs/:morphtype', component: vr_morphs, props: true },
  { path: '/morphs', redirect: '/morphs/biomorph' },
  { path: '/gear/:category/:subcategory', component: vr_gear, props: true },
  { path: '/gear/:category', component: vr_gear, props: true },
  { path: '/gear', component: vr_gear },
  { path: '/traits/:tabid', component: vr_traits, props: true},
  { path: '/traits', redirect: "/traits/positive" },
  { path: '*', redirect: '/quickrules' }
]

const vr_router = new VueRouter({
  routes: vr_routes,
  linkActiveClass: "active",
  scrollBehavior (to, from, savedPosition) {
  	let scrollables = ["subcategory"];
  	if(savedPosition) {
  		return savedPosition;
  	}

  	for(key in to.params){
  		if(scrollables.indexOf(key) > -1){
  			let rawid = to.params[key];
  			let cleanid = "#"+global_despace(rawid);
  			return {selector: cleanid};
  		}
  	}

  }
})
