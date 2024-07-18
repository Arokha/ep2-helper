Vue.component('movement-types', {
  props: {
    types: Array
  },
  template: `
    <ul>
      <li v-for="type in types">{{type.movement_type}} - {{type.base}}/{{type.full}}</li>
    </ul>
  `
});

Vue.component('gear-modal', {
  props: {
    id: String,
    title: String,
    content: String,
    charslot: String,
    inst: Function
  },
  methods: {
    add_gear() {
      if(this.charslot === "" || this.inst == null){
        show_toast("This item must be added manually!","It probably has some weird feature or something.","warning");
        return;
      }

      add_to_character(this.charslot,new this.inst(this.title),"Item: "+this.title);
    }
  },
  template: `
    <div :id="id" class="ui inverted modal">
      <div class="header">
        {{title}}
        <div class="ui labeled icon inverted basic green right floated button" @click="add_gear()">
          <i class="plus icon"></i>
          Add to Character
        </div>
      </div>
      <div class="scrolling content" v-html="content"></div>
      </div>
    </div>
  `
});

Vue.component('trait-modal', {
  props: {
    id: String,
    title: String,
    content: String,
    avego: Boolean,
    avmorph: Boolean
  },
  computed: {
    egobuttonclass() {
      let value = "ui labeled icon inverted basic green right floated button";
      if(!this.avego){
        value += " disabled";
      }
      return value;
    },
    morphbuttonclass() {
      let value = "ui labeled icon inverted basic green right floated button";
      if(!this.avmorph){
        value += " disabled";
      }
      return value;
    }
  },
  methods: {
    add_trait(charslot) {
      add_to_character(charslot,new Trait(this.title),"Trait: "+this.title);
    }
  },
  template: `
    <div :id="id" class="ui inverted modal">
      <div class="header">
        {{title}}
        <div :class="egobuttonclass" @click="add_trait('ego_traits')">
          <i class="plus icon"></i>
          Add to EGO
        </div>
        <div :class="morphbuttonclass" @click="add_trait('morph_traits')">
          <i class="plus icon"></i>
          Add to MORPH
        </div>
      </div>
      <div class="scrolling content" v-html="content"></div>
      <div class="content">
        <ul>
          <li>Available for EGO: {{avego}}</li>
          <li>Available for MORPH: {{avmorph}}</li>
        </ul>
      </div>
    </div>
  `
});

Vue.component('vcomp-stepdesc', {
  props: {
    step: Object
  },
  template: `
    <div class="ui message">
      <template v-for="section in step.guidance">
        <div class="header">{{section.heading}}</div>
        <span v-html="section.text"></span>
        <br>
      </template>
    </div>
    `
});

Vue.component('vcomp-subcategory', {
  props: {
    subcategory: Object,
    categoryname: String,
    subcategoryname: String
  },
  mounted: function() {
    this.$nextTick(function(){
      $(this.$el).find('table.sortable').tablesort();
    });
  },
  data: function() {
    let mytemplate = null;
    let mycharslot = null;
    let myclasshint = null;
   
    if(gear_templates[this.categoryname] && gear_templates[this.categoryname][this.subcategoryname]){
        var subcat_definition = gear_templates[this.categoryname][this.subcategoryname];
        mytemplate = subcat_definition.template;
        mycharslot = subcat_definition.charslot;
        myclasshint = subcat_definition.classhint;
      } else {
        mytemplate = gear_fallback;
      }

    return {mytemplate,mycharslot,myclasshint};
  },
  template: `
    <div :is="mytemplate" :charslot="mycharslot" :classhint="myclasshint" :subcategory="subcategory" :categoryname="categoryname" :subcategoryname="subcategoryname"></div>
  `
});

Vue.component('vcomp-gear-section', {
  props: {
    category: Object,
    categoryname: String
  },
  mounted: function () {
    let my_connector = this.$el.getAttribute('data-tab');
    let looking_for = ".item[data-tab='"+my_connector+"']";
    $(looking_for).tab({
      onVisible: function(){
        Vue.nextTick(function() {
          $("#gear-tabs").sticky('refresh'); // Defer to next tick to give time for height to adjust (I guess)
        });
      }
    });
  },
  template: `
    <div class="ui segment inverted">
      <div v-html="category.text"></div>
      <br><p><b>[Click any item's name for a full description and to add it to your character sheet.]</b></p>
      <vcomp-subcategory v-for="(subobj, subname) in category.subcategories" :subcategory="subobj" :categoryname="categoryname" :subcategoryname="subname" :key="subname"></vcomp-subcategory>
    </div>
    `
});

Vue.component('vcomp-morphcard', {
  props: {
    morph: Object
  },
  methods: {
    english_list: function (arr) {
        return arr.join(", ");
    },
    adopt_prompt() {
      $("#resleeve-"+this.morph.id).modal('show');
    },
    adopt_morph() {
      $("#resleeve-"+this.morph.id).modal('hide');

      if(!character_loaded){
        show_toast("Unable to locate ego!","(Open the character sheet once first.)","warning");
        return;
      }

      //Here we go!
      let from = this.morph;
      let to = character_loaded;

      //Safe to assume
      to.damage_taken = 0;
      to.wounds_taken = 0;

      //Basics
      to.morph_name = from.name;
      to.morph_mp_cost = from.cost;
      to.morph_avail = from.availability;

      //Pools
      to.insight = from.pools.insight;
      to.moxie = from.pools.moxie;
      to.vigor = from.pools.vigor;
      to.flex_morph = from.pools.flex; //NB: flex_morph

      //Dura, should set many other vars.
      to.durability_base = from.durability;

      //Ware
      to.ware.lengh = 0;
      from.ware.forEach(function(warename){
        let inst = new InvWare(warename);
        
        if(inst.source){
          //We make sure it's actually destined for 'ware'. Stupid melee/ranged ware.
          try {
            let definition = gear_templates[inst.source.category][inst.source.subcategory];
            let toarray = definition.charslot;
            if(toarray != "ware"){
              //Oof, fine.
              let better_inst = new definition.classhint(warename);
              to[toarray].push(better_inst);
            } else {
              to.ware.push(inst); //Just go to ware
            }
            
          } catch (e) { //Eh.
            console.error(e);
            to.ware.push(inst);
          }
        } else {
          to.ware.push(inst);
        }
      });

      //Traits
      to.morph_traits.lengh = 0;
      from.morph_traits.forEach(function(traitobj){
        to.morph_traits.push(new Trait(traitobj.name,null,traitobj.level));
      });

      //Movement
      to.movement_rate.lengh = 0;
      from.movement_rate.forEach(function(rate){
        to.movement_rate.push($.extend(true,{},rate));
      });

      //Type
      let mytype = morph_types.find(function(type){
        if(type.name == from.type){return true;}
      });

      if(mytype){
        to.morph_type = from.type;
        to.morph_bio = mytype.biological;
      }

      //Notes
      to.morph_notes = from.notes.join(", ");
      if(from.common_extras.length){
        to.morph_notes += ("\r\nCommon Extras: " + from.common_extras.join(", "));
      }

      show_toast("Resleeve complete!","Enjoy your new body!","success");
    }
  },
  computed: {
    noauto: function(){
      if(this.morph.type == "Flexbot"){
        return true;
      } else {
        return false;
      }
    },
    resleevebuttonclass: function(){
      if(this.noauto){
        return "ui labeled icon inverted basic green top attached button disabled"
      } else {
        return "ui labeled icon inverted basic green top attached button"
      }
    }
  },
  template: `
    <div class="ui centered card"">
      <div :id="'resleeve-'+morph.id" class="ui inverted modal">
        <div class="header">
          Resleeve to {{morph.name | titlecase}}
        </div>
        <div class="scrolling content">
          <p>You are about to resleeve into a {{morph.name | titlecase}} morph. It is a {{morph.type}} and may require an adjustment period if you are coming from a different type of morph.</p>
          <p>Your old morph will be discarded. (As in, you're about to overwrite your morph on the character sheet.)</p>
          <p>If you're sure, confirm your choice below. Otherwise click anywhere else to close the prompt.</p>
          <div class="ui labeled icon inverted basic green button" @click="adopt_morph()">
              <i class="random icon"></i>
              Resleeve!
          </div>
        </div>
      </div>    
      <div :class="resleevebuttonclass" @click="adopt_prompt()">
          <i class="random icon"></i>
          <span v-if="!noauto">Resleeve to Morph</span>
          <span v-else>Manual Resleeving Required</span>
      </div>
      <div class="content">
        <br>
        <div class="morph-pic">
          <img v-if="morph.image" :src="'images/morphs/'+morph.image">
          <img v-else src="images/morphs/none.png">
        </div>
        <div class="header">{{morph.name | titlecase}}</div>
        <div class="description">{{morph.description}}</div>
    </div>
    <div class="extra content">
        <div class="header">Basic Stats</div>
        <div class="description">
          <div class="ui horizontal stackable segments inverted">
            <div class="ui segment inverted">MP: {{morph.cost}}</div>
            <div class="ui segment inverted">AV: {{morph.availability}}</div>
            <div class="ui segment inverted">WT: {{morph.wound_threshold}}</div>
            <div class="ui segment inverted">DUR: {{morph.durability}}</div>
            <div class="ui segment inverted">DR: {{morph.death_rating}}</div>
          </div>
          <div class="ui horizontal stackable segments inverted">
            <div class="ui segment inverted">Insight: {{morph.pools.insight}}</div>
            <div class="ui segment inverted">Moxie: {{morph.pools.moxie}}</div>
            <div class="ui segment inverted">Vigor: {{morph.pools.vigor}}</div>
            <div class="ui segment inverted">Flex: {{morph.pools.flex}}</div>
          </div>
        </div>
    </div>
    <template v-if="morph.movement_rate.length">
      <div class="extra content">
          <div class="header">Movement Types</div>
          <div class="description">
            <movement-types :types="morph.movement_rate"></movement-types>
          </div>
      </div>
    </template>
    <template v-if="morph.ware.length">
      <div class="extra content">
        <div class="header">Included Ware</div>
        <div class="description">{{english_list(morph.ware)}}</div>
      </div>
    </template>
    <template v-if="morph.morph_traits.length">
      <div class="extra content">
        <div class="header">Morph Traits</div>
        <div class="description">
          <ul>
            <li v-for="trait in morph.morph_traits">{{trait.name | titlecase}} - Level {{trait.level}}</li>
          </ul>
        </div>
      </div>
    </template>
    <template v-if="morph.common_extras.length">
      <div class="extra content">
        <div class="header">Common Extras</div>
        <div class="description">{{english_list(morph.common_extras)}}</div>
      </div>
    </template>
    <template v-if="morph.common_shape_adjustments.length">
      <div class="extra content">
        <div class="header">Common Shape Adjustments</div>
        <div class="description">{{english_list(morph.common_shape_adjustments)}}</div>
      </div>
    </template>
    <template v-if="morph.notes.length">
      <div class="extra content">
        <div class="header">Additional Notes</div>
        <div class="description">{{english_list(morph.notes)}}</div>
      </div>
    </template>
  </div>
</div>
`
});

Vue.component('vcomp-typecard', {
  props: {
    mymorphs: Array,
    mytype_obj: Object,
    mytype: String
  },
  template: `
    <div class="ui segment inverted">
      <div class="ui message">
        <div class="header" v-if="mytype_obj">{{mytype_obj.name | titlecase}}</div>
        <span v-if="mytype_obj" v-html="mytype_obj.description"></span>
      </div>
      <br>
      <div class="ui three doubling cards inverted">
            <vcomp-morphcard v-for="morph in mymorphs" :morph="morph" :key="morph.name"></vcomp-morphcard>
        </div>
      </div>
    </div>
  `
});

Vue.component('vcomp-trait-table', {
  props: { 
    traits: Array 
  },
  methods: {
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  template: `
    <div>
      <b>[Click the trait name for a full description.]</b>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cost</th>
            <th>Ego</th>
            <th>Morph</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in traits">
            <tr>
              <td class="selectable" style="cursor:help;" v-on:click="modal_show(item)"><a>{{item.name | titlecase}}</a></td>
              <td class="single line">{{item['cost']}}</td>
              <td><i v-if="item.ego" class="large green checkmark icon"></i></td>
              <td><i v-if="item.morph" class="large green checkmark icon"></i></td>
              <td>{{item.summary}}</td>
            </tr>
            <trait-modal :id="item.id" :title="item.name" :content="item.description" :avego="item.ego" :avmorph="item.morph"></trait-modal>
          </template>
        </tbody>
      </table>
    </div>
`
});

Vue.component('sleight-modal', {
  props: {
    id: String,
    title: String,
    content: String,
  },
  methods: {
    add_sleight() {
      add_to_character("sleights",new Sleight(this.title),"Sleight: "+this.title);
    }
  },
  template: `
    <div :id="id" class="ui inverted modal">
      <div class="header">
        {{title}}
        <div class="ui labeled icon inverted basic green right floated button" @click="add_sleight()">
          <i class="plus icon"></i>
          Add to Character
        </div>
      </div>
      <div class="scrolling content" v-html="content"></div>
      </div>
    </div>
  `
});

Vue.component('vcomp-sleight-table', {
  props: { 
    sleights: Array 
  },
  methods: {
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  mounted: function() {
    $(this.$el).find('table.sortable').tablesort();
  },
  template: `
    <div>
      <b>[Click the sleight name for a full description.]</b>
      <table class="ui celled sortable table inverted">
        <thead>
          <tr>
            <th>Name</th>
            <th class="center aligned collapsing">Level</th>
            <th class="center aligned collapsing">Duration</th>
            <th class="center aligned collapsing">Action</th>
            <th class="no-sort">Summary</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in sleights">
            <tr>
              <td class="selectable" style="cursor:help;" v-on:click="modal_show(item)"><a>{{item.name | titlecase}}</a></td>
              <td class="single line">{{item.level}}</td>
              <td class="single line">{{item.duration}}</td>
              <td class="single line">{{item.action}}</td>
              <td>{{item.summary}}</td>
            </tr>
            <sleight-modal :id="item.id" :title="item.name" :content="item.description"></sleight-modal>
          </template>
        </tbody>
      </table>
    </div>
`
});

Vue.component('background-card', {
  props: { 
    background: Object
  },
  methods: {
    apply(){
      if(!character_loaded){
        show_toast("Open your character sheet once first!","Just click the tab to load a charcter.","warning");
        return;
      }

      if(character_loaded.background_obj){ //Won't overwrite resolved
        show_toast("Refusing to replace existing background!","Go clear it off the sheet if you're sure.","error");
        return;
      }

      this.background.skills.forEach((skill) => {
        character_loaded.increase_skill(skill.name,skill.rating,skill.options.join(" or "));
      });

      add_to_character("background",this.background.name,"You'll need to add the fields/specializations yourself though.");
    }
  },
  template: `
    <div class="ui centered card">
      <div class="content">
        <div class="header">{{background.name | titlecase}}</div>
        <div class="description"><p>{{background.description}}</p></div>
        <br>
        <div class="description">
          <div class="header">Skills</div>
          <ul>
            <li v-for="(skill,index) in background.skills">{{skill.name | titlecase}}: {{skill.rating}} <span v-if="skill.options.length">({{skill.options | orlist}})</span></li>
          </ul>
        </div>
      </div>
      <div class="ui labeled icon inverted basic green bottom attached button" @click="apply()">
        <i class="plus icon"></i>
        Apply Background
      </div>
    </div>
  `
});

Vue.component('career-card', {
  props: { 
    career: Object
  },
  methods: {
    apply(){
      if(!character_loaded){
        show_toast("Open your character sheet once first!","Just click the tab to load a charcter.","warning");
        return;
      }

      if(character_loaded.career_obj){ //Won't overwrite resolved
        show_toast("Refusing to replace existing career!","Go clear it off the sheet if you're sure.","error");
        return;
      }

      this.career.skills.forEach((skill) => {
        character_loaded.increase_skill(skill.name,skill.rating,skill.options.join(" or "));
      });

      add_to_character("career",this.career.name,"You'll need to add the fields/specializations yourself though.");
    }
  },
  template: `
    <div class="ui centered card">
      <div class="content">
        <div class="header">{{career.name | titlecase}}</div>
        <div class="description">{{career.description}}</div>
        <br>
        <div class="description">
          <div class="header">Skills</div>
          <ul>
            <li v-for="(skill,index) in career.skills">{{skill.name | titlecase}}: {{skill.rating}} <span v-if="skill.options.length">({{skill.options | orlist}})</span></li>
          </ul>
        </div>
      </div>
      <div class="ui labeled icon inverted basic green bottom attached button" @click="apply()">
        <i class="plus icon"></i>
        Apply Career
      </div>
    </div>
  `
});
Vue.component('interest-card', {
  props: { 
    interest: Object
  },
  methods: {
    apply(){
      if(!character_loaded){
        show_toast("Open your character sheet once first!","Just click the tab to load a charcter.","warning");
        return;
      }

      if(character_loaded.interest_obj){ //Won't overwrite resolved
        show_toast("Refusing to replace existing interest!","Go clear it off the sheet if you're sure.","error");
        return;
      }

      this.interest.skills.forEach((skill) => {
        character_loaded.increase_skill(skill.name,skill.rating,skill.options.join(" or "));
      });

      add_to_character("interest",this.interest.name,"You'll need to add the fields/specializations yourself though.");
    }
  },
  template: `
    <div class="ui centered card">
      <div class="content">
        <div class="header">{{interest.name | titlecase}}</div>
        <div class="description">{{interest.description}}</div>
        <br>
        <div class="card-body">
          <div class="header">Skills</div>
          <ul>
            <li v-for="(skill,index) in interest.skills">{{skill.name | titlecase}}: {{skill.rating}} <span v-if="skill.options.length">({{skill.options | orlist}})</span></li>
          </ul>        
        </div>
      </div>
      <div class="ui labeled icon inverted basic green bottom attached button" @click="apply()">
        <i class="plus icon"></i>
        Apply Interest
      </div>
    </div>
  `
});
Vue.component('faction-card', {
  props: { 
    faction: Object
  },
  methods: {
    apply(){
      if(!character_loaded){
        show_toast("Open your character sheet once first!","Just click the tab to load a charcter.","warning");
        return;
      }

      character_loaded.increase_skill("Know",30,this.faction.name);
      add_to_character("faction",this.faction.name,"Also added the faction 'Know' skill.");
    }
  },
  template: `
    <div class="ui centered card">
      <div class="content">
        <div class="header">{{faction.name | titlecase}}</div>
        <div class="description">{{faction.description}}</div>
      </div>
      <div class="ui labeled icon inverted basic green bottom attached button" @click="apply()">
        <i class="plus icon"></i>
        Apply Faction
      </div>
    </div>
  `
});

Vue.component('aptemplate-card', {
  props: { 
    aptemp: Object
  },
  methods: {
    apply(){
      if(!character_loaded){
        show_toast("Open your character sheet once first!","Just click the tab to load a charcter.","warning");
        return;
      }

      if(character_loaded.cog || character_loaded.int || character_loaded.ref || character_loaded.sav || character_loaded.som || character_loaded.wil){
        show_toast("Aptitudes already applied?","Some of your aptitudes aren't 0 on your sheet. Start from 0 first.","error");
        return;
      }
      
      let aptitudes = this.aptemp.aptitudes;
      Object.keys(aptitudes).forEach(function(key,index) {
        character_loaded.adjust_apt(key,aptitudes[key]);
      });

      show_toast("Applied aptitude template!","You should see it reflected on your sheet now.","success");
    }
  },
  template: `
    <div class="ui centered card">
      <div class="content">
        <div class="header">{{aptemp.name}}</div>
        <div class="description">
          {{aptemp.description}}
          <ul>
            <li>COG: {{aptemp.aptitudes.cognition}}</li>
            <li>INT: {{aptemp.aptitudes.intuition}}</li>
            <li>REF: {{aptemp.aptitudes.reflexes}}</li>
            <li>SAV: {{aptemp.aptitudes.savvy}}</li>
            <li>SOM: {{aptemp.aptitudes.somatics}}</li>
            <li>WIL: {{aptemp.aptitudes.willpower}}</li>
          </ul>
        </div>
      </div>
      <div class="ui labeled icon inverted basic green bottom attached button" @click="apply()">
        <i class="plus icon"></i>
        Apply Template
      </div>
    </div>
  `
});

Vue.component('gearpack-card', {
  props: { 
    gearpack: Object
  },
  computed: {
    items(){
      let items = [];
      this.gearpack.gear.forEach(function(item){
        
        let proto = find_by_name(unsorted_gear,item);
        
        if(proto){
          items.push(proto);
        } else {
          console.log("Couldn't find gearpack item: ",item);
        }

      });
      return items;
    },
    options(){
      let options = [];
      this.gearpack.options.forEach(function(option){
        let running = {name:option.name,items:[]};
        option.gear.forEach(function(item){
          let proto = find_by_name(unsorted_gear,item);
        
          if(proto){
            running.items.push(proto);
          } else {
            console.log("Couldn't find gearpack item: ",item);
          }
        });
        options.push(running);
      });
      return options;
    }
  },
  methods: {
    apply(option){
      //Build a list of everything to add
      let chosengear = [];
      chosengear.push.apply(chosengear,this.items);
      if(option){
        chosengear.push.apply(chosengear,option.items);
      }

      //Try to map the gear to slots and add it
      chosengear.forEach(function(item){
        let options = gear_templates[item.category][item.subcategory];
        //Backup
        if(!options || !options.classhint || !options.charslot){
          options = {template: gear_generic, charslot: "items", classhint: InvItem};
        }

        let inst = new options.classhint(item.name);
        inst.blueprint = 2; //You get a multi-use blueprint when you start with items
        if(item.category == "Drugs"){
          inst.quantity = 5; //You start with 5 doses of drugs
        }

        add_to_character(options.charslot,inst,"Item: "+item.name);

      });
    }
  },
  template: `
    <div class="ui centered card">
      <div class="content">
        <div class="header">{{gearpack.name}} - {{gearpack.type}}</div>
        <div class="description">
          <ul>
            <li v-for="item in items" :data-tooltip="item.subcategory" data-position="top left">{{item.name}}</li>
          </ul>
          <template v-for="option in options">
            {{option.name}} extras:
            <ul>
              <li v-for="item in option.items" :data-tooltip="item.subcategory" data-position="top left">{{item.name}}</li>
            </ul>
          </template>
        </div>
      </div>
      <div class="extra content">
        <div class="ui two buttons">
          <template v-if="!options.length">
            <div class="ui labeled icon inverted basic green button" @click="apply()">
              <i class="plus icon"></i>
              Add Gear
            </div>
          </template>
          <template v-else>
            <div v-for="option in options" class="ui labeled icon inverted basic green button" @click="apply(option)">
              <i class="plus icon"></i>
              Add {{option.name}}
            </div>
          </template>
        </div>
      </div>
    </div>
  `
});

/** Filter to replace spaces and other strange characters with underscores. */
Vue.filter('despace', function (value) {
  if (!value) return '';
  return global_despace(value);
});

Vue.filter('titlecase', function (value) {
  return value.toTitleCase();
});

Vue.filter('commalist', function (array) {
  if (!array) return '';
  return array.join(", ");
});

Vue.filter('orlist', function (array) {
  if (!array) return '';
  return array.join(", ").replace(/, ((?:.(?!, ))+)$/, ', or $1');
});
