Vue.use(VueRouter);

const vr_quickrules = function() {
  return $.ajax("static/quickrules.html").then(function(templateHtml) {
    return {template: templateHtml};
  });
};

const vr_sheet = function() {
  return $.ajax("static/sheet.html").then(function(templateHtml) {
    return {
      data: function() {
        return {
          character: null,
          aptitudes,
          base64export: null,
          exportfilename: "ep2_export.txt",
          rolls: []
        };
      },
      methods: {
        skillTotal(skill,character){
          return skillTotal(skill,character);
        },
        new_morph_trait(type){
          this.character.morph_traits.push(new Trait(null,type));
        },
        new_ego_trait(type){
          this.character.ego_traits.push(new Trait(null,type));
        },
        new_morph_ware(){
          this.character.ware.push(new InvWare());
        },
        new_item(){
          this.character.items.push(new InvItem());
        },
        new_ranged_wep(){
          this.character.weapons_ranged.push(new InvRangedWep(null,"Ranged Weapons"));
        },
        new_melee_wep(){
          this.character.weapons_melee.push(new InvWep(null,"Melee Weapons"));
        },
        new_armor(){
          this.character.armors.push(new InvArmor());
        },
        new_bot(){
          this.character.bots.push(new InvBot());
        },
        new_botware(bot){
          bot.ware.push(new InvWare());
        },
        new_vehicle(){
          this.character.vehicles.push(new InvVehicle());
        },
        new_vehicleware(vehicle){
          vehicle.ware.push(new InvWare());
        },
        new_skill(){
          this.character.skills.push(new Skill());
        },
        new_muse_skill(){
          this.character.muse.skills.push(new Skill());
        },
        add_item_mod(item,event){
          item.mods.push(prompt("Please enter the new mod:", ""));
        },
        rem_item_mod(item,mod,event){
          var indexof = item.mods.indexOf(mod);
          item.mods.splice(indexof, 1);
        },
        add_skill_spec(skill,event){
          skill.specializations.push(prompt("Please enter the new specialization:", ""));
        },
        rem_skill_spec(skill,spec,event){
          var indexof = skill.specializations.indexOf(spec);
          skill.specializations.splice(indexof, 1);
        },
        new_psi_event(){
          this.character.influence_events.push({event:"<Input Event Info>"});
        },
        new_psi_sleight(){
          this.character.sleights.push(new Sleight());
        },
        cycle_morph_type(){
          var index = -1;
          morph_types.find( (el,eli) => {
            if(el.name == this.character.morph_type){
              index = eli;
              return true; //We don't care about the object tbh
            }
          });

          //Found
          if(index >= 0 && index+1 < morph_types.length){
            this.character.morph_type = morph_types[index+1].name;
            this.character.morph_bio = morph_types[index+1].biological;
          } else {
            this.character.morph_type = morph_types[0].name;
            this.character.morph_bio = morph_types[0].biological;
          }
        },

        //Just roll and log, no frills
        roll_and_log(target,reason,dicestr){
          let result = this.perform_roll(target,reason,dicestr);
          if(result)
            this.log_roll(result);
        },

        //Just open the modal
        show_rolls(){
          $("#sheet-rolls").modal('show');
        },

        //Roll a custom dice string from the box
        custom_roll(){
          let reasonval = $("#custom-reason").val();
          let dicestr = $("#custom-dice").val();
          if(reasonval){
            reasonval += " (Custom)";
          }
          this.roll_and_log($("#custom-target").val(),reasonval||"Custom Roll",dicestr);
        },

        //Roll a skill with frills (specialization, default considerations, etc)
        skill_roll_and_log(skill,spec = false){
          //Get the value of the aptitude
          if(this.character[skill.aptitude] == undefined){
            show_toast("No Aptitude?","That aptitude is 0 (impossible) or typed wrong.","error");
            return;
          }
          
          //Get the skill total
          let target = skillTotal(skill,this.character);
          
          //Are we using a specialization?
          if(spec){
            target += 10;
          }
          
          //Roll our thing and grab the resulting log
          let log_entry = this.perform_roll(target,skill.name + " Check");
          if(!log_entry){
            show_toast("Dice roll failed?","I didn't get an answer back from the roller!","error");
            return;
          }

          //Can't get crit success when defaulting on skills
          if((skill.rank === 0) && log_entry.roll.text == "Critical Success!"){
              if((log_entry.roll.result >= 66) && (success)){
                log_entry.roll.text = "Two Superior Successes!";
              } else if((log_entry.roll.result >= 33) && (success)){
                log_entry.roll.text = "One Superior Success!";
              } else {
                log_entry.roll.text = "Success!";
              }
              log_entry.notes.push("Critical success ignored due to skill defaulting.");
          }

          //Note if we had a spec so they can see it in the log
          if(spec){
            log_entry.notes.push("+10 from specialization: "+spec);
          }

          //Log it
          this.log_roll(log_entry);

        },
        log_roll(results_obj){
          this.rolls.push(results_obj);
          $('#sheet-rolls').modal('show');
        },
        perform_roll(target,reason,dicestr){
          var logged_roll = {
            reason,
            original_target: target,
            modified_target: null,
            roll: null,
            notes: [],
            dicestr
          };

          let rolled = null;
          if(!dicestr || dicestr == "1d100" || dicestr == "d100"){
            if(this.character.traumas_taken){
              let penalty = this.character.traumas_taken*-10;
              target += penalty;
              logged_roll.notes.push(`Penalty of ${penalty} due to ${this.character.traumas_taken} traumas!`);
            }

            if(this.character.wounds_taken){
              let penalty = this.character.wounds_taken*-10;
              target += penalty;
              logged_roll.notes.push(`Penalty of ${penalty} due to ${this.character.wounds_taken} wounds!`);
            }
            
            logged_roll.modified_target = target; //We modified our target
            rolled = roll_dice(target); //Roll the dice
          } else {
            rolled = parse_and_roll(dicestr);
          }          

          if(!rolled) {
            return;
          }

          logged_roll.roll = rolled; //Attach it to our log object
          return logged_roll;
        },
        default_skills(){
          this.character.skills = [
          new Skill("Athletics","SOM",0,0,true),
          new Skill("Deceive","SAV",0,0,true),
          new Skill("Fray","REF",0,0,true),
          new Skill("Free Fall","REF",0,0,true),
          new Skill("Guns","REF",0,0,true),
          new Skill("Infiltrate","REF",0,0,true),
          new Skill("Infosec","COG",0,0,true),
          new Skill("Interface","COG",0,0,true),
          new Skill("Kinesics","SAV",0,0,true),
          new Skill("Melee","SOM",0,0,true),
          new Skill("Perceive","INT",0,0,true),
          new Skill("Persuade","SAV",0,0,true),
          new Skill("Program","COG",0,0,true),
          new Skill("Provoke","SAV",0,0,true),
          new Skill("Psi","WIL",0,0,false),
          new Skill("Research","INT",0,0,true),
          new Skill("Survival","INT",0,0,true),
          new Skill("Hardware: ?","COG",0,0,false),
          new Skill("Medicine: ?","COG",0,0,false),
          new Skill("Pilot: ?","REF",0,0,false),
          new Skill("Know: ?","?",0,0,false)
          ];
        },
        default_muse(){
          this.character.muse.skills = [
          //Muse skills aren't mandatory in case you want to run weird games
          new Skill("Hardware: Electronics","COG",20,0,false),
          new Skill("Infosec","COG",20,0,false),
          new Skill("Interface","COG",50,0,false),
          new Skill("Know: Accounting","COG",50,0,false),
          new Skill("Know: Psychology","COG",50,0,false),
          new Skill("Medicine: Psychosurgery","COG",20,0,false),
          new Skill("Perceive","INT",0,0,false),
          new Skill("Program","COG",20,0,false),
          new Skill("Research","INT",15,0,false),
          new Skill("Know: ?","?",30,0,false),
          ]
        },
        defaults(){
          this.character = new Character();
          this.default_skills();
          this.default_muse();
          character_loaded = this.character; //Global reference so we can play with it.
        },
        show_wipe_dialog(){
          $('#character-wipe').modal('show');
        },
        wipe(){
          this.defaults();
          $('#character-wipe').modal('hide');
          var browserStore = window.localStorage;
          browserStore.removeItem('ep2character');
        },
        update_export(){
          let preparing = $.extend(true,{},serial_character);
          export_properties(this.character,preparing,serial_character);
          let uncomp = JSON.stringify(preparing);
          let comp = LZString.compressToBase64(uncomp);
          let final =
`// Eclipse Phase Second Edition Character Export
// https://arokha.com/eclipsehelper
// Data is compressed with lz-string compressToBase64()
// Character Name: ${this.character.name}
// Character Data: v${this.character.version}
` + comp;
          this.base64export = final;
        },
        export_character(){
          this.update_export();
          $('#export-modal').modal('show');
          this.$nextTick(function(){
            $("#export-textarea").scrollTop(0);
          });
        },
        copy_export(){
          $("#export-textarea").focus().select();
          try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log("Copying export was " + msg);
          } catch (err) {
            console.log("Couldn't copy export due to exception");
          }
        },
        download_export(){
          this.update_export(); //Just to be sure
          download(this.exportfilename, this.base64export);
        },
        import_file_change(element){
          let files = element.target.files || element.dataTransfer.files;
          if(!files.length)
            return;
          let reader = new FileReader();
          reader.onload = (evt) => {
            let result = evt.target.result;
            $("#import-textarea").val(result);
            this.import_character(result);
          };
          var firstfile = files[0];
          if(firstfile.type != "text/plain"){
            show_toast("Import Error!","This doesn't appear to be plaintext.","error");
            return;
          }
          if(firstfile.size > 512000){ //I doubt you could make a 500k character legitimately
            show_toast("Import Error!","File unreasonably large.","error");
            return;
          }
          this.exportfilename = firstfile.name;
          reader.readAsText(firstfile);
        },
        import_character(val){
          try {
            let base64 = val || $("#import-textarea").val();

            //Scrape comments
            base64 = base64.replace(/\/\/.*[\r\n]+/gm,"");
            
            //Decompress
            let decomp = JSON.parse(LZString.decompressFromBase64(base64));
            
            //Try to import properties
            this.character = character_loaded = new Character(decomp);
            
            //Drop modal if it worked
            $("#import-modal").modal('hide');
            show_toast("Imported Character","Name: "+this.character.name,"success");
          } catch (e) {
            console.error(e);
            show_toast("Import Error!","This appears to be malformed data.","error");
          }
        },
        show_import_dialog(){
          $("#import-modal").modal('show');
        },
        save_character(){
          this.update_export();
          var browserStore = window.localStorage;
          browserStore.setItem('ep2character', this.base64export);
          $('body')
            .toast({
              title: 'Saved Character',
              message: "You should occasionally back up your data via 'Export' also.",
              displayTime: 7000,
              showProgress: "bottom"
            });
        },
        load_from_localstorage(){
          var browserStore = window.localStorage;
          var save = browserStore.getItem('ep2character');
          if(save){
            this.import_character(save);
            return true;
          }
          return false;
        },
        show_tips(){
          $("#tips-modal").modal('show');
        },
        close_tips(){
          $("#tips-modal").modal('hide');
        },
        close_newchar_notice(){
          $("#sheetnotice-modal").modal('hide');
        },
        send_to_tracker(){
          vr_router.push("tracker").then(() => {
            if(_.find(vue_tracker.characters,this.character)){
              show_toast("That character is already in the tracker!","I'm not going to add them a second time.","warning");
              return;
            }
            vue_tracker.characters.push(this.character);
          });
        }
      },
      computed: {
        reverse_rolls(){
          return this.rolls.slice().reverse();
        }
      },
      created: function (){
        vue_sheet = this;
        if(!this.character){
          this.defaults();
        }
        this.load_from_localstorage();
      },
      mounted: function (){
        $(this.$el).on("click",".clickedit, .selectable",function(event){
          $(event.currentTarget).find(".prop[contentEditable=true]").first().focus();
        });
        //Lazy test for 'anything' getting loaded.
        if((this.character.name == "<Input Name>") && (this.character.background == "<Input Background>")) {
          $("#sheetnotice-modal").modal({blurring: true}).modal('show');
        }
        //Prep these modals
        $('#export-modal').modal({autofocus: false});
        $('#import-modal').modal();
      },
      template: templateHtml
    };
  });
};

var vue_tracker = null;
const vr_tracker = function() {
  return $.ajax("static/tracker.html").then(function(templateHtml) {
    return {
      data: function() {
        return {
          characters: [],
          base64export: null,
          tobedeleted: null
        };
      },
      created() {
        vue_tracker = this;
        this.load_from_localstorage();
      },
      methods: {
        skillTotal(skill,character){
          return skillTotal(skill,character);
        },
        edit(character){
          vr_router.push("sheet").then(() => {
            //Already loaded
            if(character_loaded == character){
              return;
            }
            if(!_.find(this.characters,character_loaded) && (character_loaded.name != "<Input Name>")){
              show_toast("Would overwrite character!","Clear the sheet or save them in the tracker first.","error");
              return;
            }
            vue_sheet.character = character;
            character_loaded = character;
          });
        },
        update_export(){
          let prepped_array = [];
          _.each(this.characters, function(character) {
            let prep = $.extend(true,{},serial_character);
            export_properties(character,prep,serial_character); //This mutates 2nd arg
            prepped_array.push(prep);
          });
          let uncomp = JSON.stringify(prepped_array);
          let comp = LZString.compressToBase64(uncomp);
          let final =
`// Eclipse Phase Second Edition Tracker Export
// https://arokha.com/eclipsehelper
// Data is compressed with lz-string compressToBase64()
` + comp;
          this.base64export = final;
        },
        export_tracker(){
          $("#trackerexportbutton").addClass("loading");
          this.update_export();
          download("ep2tracker.txt",this.base64export);
          $("#trackerexportbutton").removeClass("loading");
        },
        import_tracker(base64){
          try {
            //Scrape comments
            base64 = base64.replace(/\/\/.*[\r\n]+/gm,"");
            
            //Decompress
            let decomp = JSON.parse(LZString.decompressFromBase64(base64));
            
            //Try to import properties
            _.each(decomp,(character) => {
              let newchar = new Character(character);
              this.characters.push(newchar);
            });
            
            show_toast("Imported Tracker","Import complete!","success");
          } catch (e) {
            console.error(e);
            show_toast("Import Error!","This appears to be malformed data.","error");
          } finally {
            $("#trackerimportbutton").removeClass("loading");
          }
        },
        import_file_change(element){
          $("#trackerimportbutton").addClass("loading");
          let files = element.target.files || element.dataTransfer.files;
          if(!files.length)
            return;
          let reader = new FileReader();
          reader.onload = (evt) => {
            let result = evt.target.result;
            this.import_tracker(result);
          };
          var firstfile = files[0];
          if(firstfile.type != "text/plain"){
            show_toast("Import Error!","This doesn't appear to be plaintext.","error");
            return;
          }
          if(firstfile.size > 5120000){ //I doubt you could make a 5000k tracker legitimately
            show_toast("Import Error!","File unreasonably large.","error");
            return;
          }
          reader.readAsText(firstfile);
          element.target.value = '';
        },
        save_tracker(){
          this.update_export();
          var browserStore = window.localStorage;
          browserStore.setItem('ep2tracker', this.base64export);
          $('body')
            .toast({
              title: 'Saved Tracker',
              message: "You should occasionally back up your data via 'Export' also.",
              displayTime: 7000,
              showProgress: "bottom"
            });
        },
        load_from_localstorage(){
          var browserStore = window.localStorage;
          var save = browserStore.getItem('ep2tracker');
          if(save){
            this.import_tracker(save);
            return true;
          }
          return false;
        },
        show_wipe_dialog(){
          $('#tracker-wipe').modal('show');
        },
        wipe(){
          this.characters.splice(0,this.characters.length);
          $('#tracker-wipe').modal('hide');
          var browserStore = window.localStorage;
          browserStore.removeItem('ep2tracker');
        },
        del(){
          let delindex = this.characters.findIndex( el => el === this.tobedeleted );
          this.characters.splice(delindex,1);
          $('#tracker-del').modal('hide');
        },
        show_del_dialog(character){
          this.tobedeleted = character;
          $('#tracker-del').modal('show');
        },
        show_tips(){
          $('#trackertips-modal').modal('show');
        },
        close_tips(){
          $('#trackertips-modal').modal('hide');
        },
        quick_roll(character,target){
          let modifier = (character.wounds_taken * 10) + (character.traumas_taken * 10);
          let new_target = target -= modifier;
          if(target <= 0){
            show_toast("Target would be negative or zero with wounds/traumas.","You can consider that a failure.","error",7000);
            return;
          }

          let roll = roll_dice(new_target);
          let topmessage = "Rolled a " + roll.result + " against " + new_target;
          show_toast(topmessage,roll.text,roll.success ? "success":"error",7000);
        },
        show_sort(){
          $('#sort-tracker').modal('show');
        },
        hide_sort(){
          $('#sort-tracker').modal('hide');
        },
      },
      template: templateHtml
    }
  });
}

const vr_chargen = function() {
  return $.ajax("static/chargen.html").then(function(templateHtml) {
    return {
      template: templateHtml,
      data: function() {
        return {
          chargen: [],
          backgrounds,
          careers,
          interests,
          factions,
          aptemps,
          reputations,
          gearpacks,
          skills,
          cpspends: []
        };
      },
      computed: {
        cpspent() {
          return _.sumBy(this.cpspends, spend => spend.cost);
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
      methods: {
        skill_types(skill){
          let types = [];
          if(skill.active){types.push("Active")}
          if(skill.combat){types.push("Combat")}
          if(skill.physical){types.push("Physical")}
          if(skill.technical){types.push("Technical")}
          if(skill.social){types.push("Social")}
          if(skill.know){types.push("Know")}
          if(skill.field){types.push("Field")}
          if(skill.mental){types.push("Mental")}
          if(skill.psi){types.push("Psi")}
          if(skill.vehicle){types.push("Vehicle")}
          return types.join(", ");
        }
      },
      updated: function () {
        $(this.$el).find('table').tablesort();
      },
      mounted: function(){
        // Tabs are already hard coded in the template, we'e good to initialize tabs
        $(this.$el).find("#chargen-" + this.$route.params.step).addClass("active");
        Vue.nextTick(() => {
            $(".sticky", this.$el).sticky();
        });
      }
    };
  });
}

const vr_morphs = {
  data: function () {
    return {
      morphs,
      morph_types
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
          <router-link class="item" to="uplift">Uplift Biomorphs</router-link>
          <router-link class="item" to="exomorph">Exomorph Biomorphs</router-link>
          <router-link class="item" to="synthmorph">Synthmorphs</router-link>
          <router-link class="item" to="infomorph">Infomorphs</router-link>
          <router-link class="item" to="core">Core Morphs</router-link>
          <router-link class="item" to="flexbot">Flexbots</router-link>
        </div>
      </div>
      <div class="fourteen wide stretched column">
      	<vcomp-typecard :mymorphs="current_morphs" :mytype_obj="current_typeobj" mytype=""></vcomp-typecard>
      </div>
    </div>
  </div>
  `,
  beforeRouteEnter (to,from,next) {
    $("#datadropdown").addClass("fakeactive");
    next();
  },
  beforeRouteLeave (to,from,next) {
    $("#datadropdown").removeClass("fakeactive");
    next();
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
        case "exomorph":
          return this.exomorph_biomorphs;
        case "synthmorph":
          return this.synthmorphs;
        case "infomorph":
          return this.infomorphs;
        case "flexbot":
          return this.flexbot_parts;
        case "core":
          return this.core_morphs;
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
    exomorph_biomorphs: function () {
      return this.morphs.filter(function(element){
        if(element.type == "Exomorph"){return true;}
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
    core_morphs: function () {
      return this.morphs.filter(function(element){
        if(element.type == "Core"){return true;}
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
  data() {
    return {
      unsorted_gear,
      gear_types,
      search_text: null,
      search_results: [],
    }
  },
  props: {
  	category: String,
  	subcategory: String
  },
  beforeRouteEnter (to,from,next) {
    $("#datadropdown").addClass("fakeactive");
    next();
  },
  beforeRouteLeave (to,from,next) {
    $("#datadropdown").removeClass("fakeactive");
    next();
  },
  template: `
  <div class="ui segment inverted">
    <div id="gear-grid" class="ui grid">
      <div class="sixteen wide column">
        <div class="ui segment inverted">
          <div id="gearsearch" class="ui inverted transparent left icon input">
            <input v-model="search_text" type="text" placeholder="Search...">
            <i v-if="!search_results.length" class="search icon"></i>
            <i v-else @click.stop.prevent="clearSearch" class="times link icon"></i>

          </div>
          <div v-show="search_results.length">
            <div class="ui divider"></div>
            <h3>Search Results:</h3>
            <ul>
              <li v-for="result in search_results">
              <router-link :to="'/gear/'+result.item.category+'/'+despace(result.item.subcategory)">{{result.item.name}}</router-link>
               - 
              (Relevancy: {{100-Math.floor(result.score*100)}}%)
               - 
              {{result.item.category}} / {{result.item.subcategory}}</li>
            </ul>
            <div class="ui divider"></div>
            <a @click.prevent.stop="clearSearch" style="cursor: pointer;">[Clear Results]</a>
          </div>
        </div>
      </div>
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
    $.getJSON('data/gear_categories.json').then( (json) => {
      this.gear_types = json;
    });
    this.debouncedGetSearch = _.debounce(this.getSearch, 500)
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
    },
    search_text(oldSearch,newSearch){
      $("#gearsearch").addClass('loading');
      this.debouncedGetSearch()
    }
  },
  methods: {
  	despace(value) {
  		return global_despace(value);
  	},
    getSearch(){
      $("#gearsearch").removeClass('loading');
      if(!this.search_text){
        this.search_results = [];
        return;
      }
      this.search_results = gear_fuse.search(this.search_text);
      this.$nextTick(()=>{$(".sticky", this.$el).sticky('refresh');});
    },
    clearSearch(){
      this.search_results = [];
      this.search_text = "";
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

      //Iterate over the unsorted gear blob
      this.unsorted_gear.forEach((item_object) => {
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
        let mycategorydef = this.gear_types.find((categorydef) => {
          return categorydef.name == category;
        });
        
        if(mycategorydef) {
          new_category.text = mycategorydef.text;
        }
        
        //Get all my items
        let this_category = this.unsorted_gear.filter((maybe_mine,index) => {
            return maybe_mine.category == category;
        });

        //I wish I had subcategories
        this_category.forEach((my_item) => {
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
          if(mycategorydef && subcategory.toLowerCase() in mycategorydef.subcategories){
            new_subcategory.text = mycategorydef.subcategories[subcategory.toLowerCase()]['text'];
          }

          new_category['subcategories'][subcategory] = new_subcategory;
        });
        new_cats[category] = new_category;
      });
      //Done!
      return new_cats;
    }
  }
}

const vr_traits = {
  data: function() {
    return {
      traits
    };
  },
  props: {
    tabid: String
  },
  beforeRouteEnter (to,from,next) {
    $("#datadropdown").addClass("fakeactive");
    next();
  },
  beforeRouteLeave (to,from,next) {
    $("#datadropdown").removeClass("fakeactive");
    next();
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

const vr_sleights = {
  data: function() {
    return {
      sleights
    };
  },
  props: {
    tabid: String
  },
  beforeRouteEnter (to,from,next) {
    $("#datadropdown").addClass("fakeactive");
    next();
  },
  beforeRouteLeave (to,from,next) {
    $("#datadropdown").removeClass("fakeactive");
    next();
  },
  template: `
  <div class="ui segment inverted">  
    <vcomp-sleight-table :sleights="sleights"></vcomp-sleight-table>
  </div>
  `
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
  { path: '/sheet', component: vr_sheet },
  { path: '/tracker', component: vr_tracker },
  { path: '/chargen', redirect: '/chargen/1' },
  { path: '/chargen/:step', component: vr_chargen },
  { path: '/primer', redirect: '/primer/whatis' },
  { path: '/primer/:step', component: vr_primer },
  { path: '/morphs/:morphtype', component: vr_morphs, props: true },
  { path: '/morphs', redirect: '/morphs/biomorph' },
  { path: '/gear/:category/:subcategory', component: vr_gear, props: true },
  { path: '/gear/:category', component: vr_gear, props: true },
  { path: '/gear', component: vr_gear },
  { path: '/traits/:tabid', component: vr_traits, props: true },
  { path: '/traits', redirect: "/traits/positive" },
  { path: '/sleights', component: vr_sleights, props: true },
  { path: '*', redirect: "/primer/whatis" }
]

const vr_router = new VueRouter({
  base: "/eclipsehelper/",
  mode: "history",
  routes: vr_routes,
  linkActiveClass: "active",
  scrollBehavior (to, from, savedPosition) {

    //This actually makes things worse, and it seems browsers handle this some other way
    //  natively during popstate navigation.
    /*
    if(savedPosition) {
  		return savedPosition;
  	}
    */

    //Maybe we have a param we know how to scroll to
    let scrollables = ["subcategory"];
  	for(key in to.params){
  		if(scrollables.indexOf(key) > -1){
  			let rawid = to.params[key];
  			let cleanid = "#"+global_despace(rawid);
  			return {selector: cleanid};
  		}
  	}

    //Guess we didn't return, just go to the top
    return { x: 0, y: 0 };
  }
});
