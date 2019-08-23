var gear_fallback = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      [No gear template for this subcategory!]
    </div>
  `}

var gear_generic = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  methods: {
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th><th>Cmp/GP</th><th>Summary</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in subcategory.items">
            <tr>
              <td style="cursor:help;" v-on:click="modal_show(item)"><a>{{item.name}}</a></td><td>{{item['complexity/gp']}}</td><td>{{item.summary}}</td>
            </tr>
            <info-modal :id="item.id" :title="item.name" :content="item.description"></info-modal>
          </template>
        </tbody>
      </table>
    </div>
`}

var gear_drugs = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  methods: {
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cmp/GP</th>
            <th>Type</th>
            <th>Application</th>
            <th>Duration</th>
            <th>Addiction</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in subcategory.items">
            <tr>
              <td style="cursor:help;" v-on:click="modal_show(item)"><a>{{item.name}}</a></td>
              <td>{{item['complexity/gp']}}</td>
              <td>{{item.type}}</td>
              <td>{{item.application}}</td>
              <td>{{item.duration}}</td>
              <td>{{item.addiction}}</td>
              <td>{{item.summary}}</td>
            </tr>
            <info-modal :id="item.id" :title="item.name" :content="item.description"></info-modal>
          </template>
        </tbody>
      </table>
    </div>
`}

var gear_ware = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  methods: {
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cmp/GP</th>
            <th>Bio</th>
            <th>Cybr</th>
            <th>Hard</th>
            <th>Mesh</th>
            <th>Nano</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in subcategory.items">
            <tr>
              <td style="cursor:help;" v-on:click="modal_show(item)"><a>{{item.name}}</a></td>
              <td>{{item['complexity/gp']}}</td>
              <td><i v-if="item.bioware" class="large green checkmark icon"></i></td>
              <td><i v-if="item.cyberware" class="large green checkmark icon"></i></td>
              <td><i v-if="item.hardware" class="large green checkmark icon"></i></td>
              <td><i v-if="item.meshware" class="large green checkmark icon"></i></td>
              <td><i v-if="item.nanoware" class="large green checkmark icon"></i></td>
              <td>{{item.summary}}</td>
            </tr>
            <info-modal :id="item.id" :title="item.name" :content="item.description"></info-modal>
          </template>
        </tbody>
      </table>
    </div>
`}

var gear_vehicles = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  methods: {
    english_list: function (arr) {
        return arr.join(", ");
    },
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cmp/GP</th>
            <th>Pass</th>
            <th>Vigor</th>
            <th>Flex</th>
            <th>Armor</th>
            <th>WT</th>
            <th>DUR</th>
            <th>DR</th>
            <th>Size</th>
            <th>Movement</th>
            <th>Ware</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in subcategory.items">
            <tr>
              <td style="cursor:help;" v-on:click="modal_show(item)"><a>{{item.name}}</a></td>
              <td>{{item['complexity/gp']}}</td>
              <td>{{item.passengers}}</td>
              <td>{{item.vigor}}</td>
              <td>{{item.flex}}</td>
              <td>{{item.armor_energy}}/{{item.armor_kinetic}}</td>
              <td>{{item.wound_threshold}}</td>
              <td>{{item.durability}}</td>
              <td>{{item.death_rating}}</td>
              <td>{{item.size}}</td>
              <td><movement-types :types="item.movement_rate"></movement-types></td>
              <td>{{english_list(item.ware)}}</td>
              <td>{{item.notes}}</td>
            </tr>
            <info-modal :id="item.id" :title="item.name" :content="item.description"></info-modal>
          </template>
        </tbody>
      </table>
    </div>
`}

var gear_bots = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  methods: {
    english_list: function (arr) {
        return arr.join(", ");
    },
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cmp/GP</th>
            <th>Vigor</th>
            <th>Flex</th>
            <th>Armor</th>
            <th>WT</th>
            <th>DUR</th>
            <th>DR</th>
            <th>Size</th>
            <th>Movement</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in subcategory.items">
            <tr>
              <td style="cursor:help;" v-on:click="modal_show(item)" rowspan="2"><a>{{item.name}}</a></td>
              <td>{{item['complexity/gp']}}</td>
              <td>{{item.vigor}}<span v-if="item.vigor2">&nbsp;({{item.vigor2}})</span></td>
              <td>{{item.flex}}</td>
              <td>{{item.armor_energy}}/{{item.armor_kinetic}}</td>
              <td>{{item.wound_threshold}}</td>
              <td>{{item.durability}}</td>
              <td>{{item.death_rating}}</td>
              <td>{{item.size}}</td>
              <td><movement-types :types="item.movement_rate"></movement-types></td>
            </tr>
            <tr>
              <td colspan="9"><b>Ware: </b>{{english_list(item.ware)}}</td>
            </tr>
            <info-modal :id="item.id" :title="item.name" :content="item.description"></info-modal>
          </template>
        </tbody>
      </table>
    </div>
`}

var gear_creatures = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  methods: {
    english_list: function (arr) {
        return arr.join(", ");
    },
    namerowspan: function(item) {
      let span = 2; //At least name and movement row
      if(item.ware.length){span++;}
      if(item.traits.length){span++;}
      if(item.notes.length){span++;}
      if(item.skills.length){span++;}
      return span;
    },
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cmp/GP</th>
            <th>COG</th>
            <th>INT</th>
            <th>REF</th>
            <th>SAV</th>
            <th>SOM</th>
            <th>WIL</th>
            <th>INIT</th>
            <th>TP</th>
            <th>Armor</th>
            <th>WT/DUR/DR</th>
            <th>TT/LUC/IR</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in subcategory.items">
            <tr>
              <td style="cursor:help;" v-on:click="modal_show(item)" :rowspan="namerowspan(item)"><a>{{item.name}}</a></td>
              <td>{{item['complexity/gp']}}</td>
              <td>{{item.attributes.cognition}}<sup>{{item.attributes.cognition_check}}</sup></td>
              <td>{{item.attributes.intuition}}<sup>{{item.attributes.intuition_check}}</sup></td>
              <td>{{item.attributes.reflexes}}<sup>{{item.attributes.reflexes_check}}</sup></td>
              <td>{{item.attributes.savvy}}<sup>{{item.attributes.savvy_check}}</sup></td>
              <td>{{item.attributes.somatics}}<sup>{{item.attributes.somatics_check}}</sup></td>
              <td>{{item.attributes.willpower}}<sup>{{item.attributes.willpower_check}}</sup></td>
              <td>{{item.attributes.initiative}}</td>
              <td>{{item.attributes.tp}}</td>
              <td>{{item.attributes.armor_energy}}/{{item.attributes.armor_kinetic}}</td>
              <td>{{item.attributes.wound_threshold}}/{{item.attributes.durability}}/{{item.attributes.death_rating}}</td>
              <td>{{item.attributes.trauma_threshold}}/{{item.attributes.lucidity}}/{{item.attributes.insanity_rating}}</td>
            </tr>
            <tr v-if="item.ware.length">
              <td colspan="12"><b>Ware: </b>{{english_list(item.ware)}}</td>
            </tr>
            <tr v-if="item.traits.length">
              <td colspan="12"><b>Traits: </b>{{english_list(item.traits)}}</td>
            </tr>
            <tr v-if="item.skills.length">
              <td colspan="12"><b>Skills: </b>{{english_list(item.skills)}}</td>
            </tr>
            <tr v-if="item.notes">
              <td colspan="12"><b>Notes: </b>{{item.notes}}</td>
            </tr>
            <tr>
              <td colspan="12"><movement-types :types="item.movement_rate"></movement-types></td>
            </tr>
            <info-modal :id="item.id" :title="item.name" :content="item.description"></info-modal>
          </template>
        </tbody>
      </table>
    </div>
`}

//Map subcategories to templates to use
var gear_templates = {
  "Comms":{
      "Communication Gear":gear_generic,
      "Neutrino Comms Gear":gear_generic,
      "Quantum Farcasters":gear_generic,
      "QE Comms Gear":gear_generic,
      "Mesh Hardware":gear_generic
  },
  "Creatures":{
      "GMOs":gear_creatures,
      "Smart Animals":gear_creatures,
      "Xenofauna":gear_creatures
  },
  "Drugs":{
      "Cognitive Drugs":gear_drugs,
      "Combat Drugs":gear_drugs,
      "Health Drugs":gear_drugs,
      "Nanodrugs":gear_drugs,
      "Narcoalgorithms":gear_drugs,
      "Petals":gear_drugs,
      "Psi Drugs":gear_drugs,
      "Recreational":gear_drugs,
      "Social Drugs":gear_drugs,
      "Toxins":gear_drugs,
      "Nanotoxins":gear_drugs
  },
  "Services":{
      "Mesh Services":gear_generic,
      "Physical Services":gear_generic
  },
  "Software":{
      "Skillsoft":gear_generic,
      "Apps":gear_generic,
      "ALIs":gear_generic,
      "Scorchers":gear_generic,
      "TacNet":gear_generic
  },
  "Tech":{
      "Bots":gear_bots,
      "Everyday":gear_generic,
      "Chemicals":gear_generic,
      "Exploration Tools":gear_generic,
      "Salvage Tools":gear_generic,
      "Science Tools":gear_generic,
      "Survival Tools":gear_generic,
      "Vacsuits":gear_generic,
      "Nanotech Gear":gear_generic,
      "Hives":gear_generic,
      "Nanofabricators":gear_generic,
      "Specialized Fabbers":gear_generic,
      "Espionage/Security":gear_generic,
      "Swarms":gear_generic
  },
  "Vehicles":{
      "Aircraft":gear_vehicles,
      "Exoskeletons":gear_vehicles,
      "Groundcraft":gear_vehicles,
      "Hardsuits":gear_vehicles,
      "Hybrids":gear_vehicles,
      "Nautical Craft":gear_vehicles,
      "Pers Transport":gear_vehicles,
      "Spacecraft":gear_vehicles
  },
  "Ware":{
      "Combat":gear_ware,
      "Mental":gear_ware,
      "Physical":gear_ware,
      "Sensory":gear_ware,
      "Social":gear_ware,
      "Standard":gear_ware,
      "Meshware":gear_ware
  }
}