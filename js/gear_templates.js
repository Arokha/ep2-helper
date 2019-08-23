var gear_fallback = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      [Missing gear template!]
    </div>
  `}
var gear_generic = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th><th>Complexity/GP</th><th>Summary</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in subcategory.items">
            <tr>
              <td>{{item.name}}</td><td>{{item['complexity/gp']}}</td><td>{{item.summary}}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
`}

var gear_drugs = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th><th>Complexity/GP</th><th>Type</th><th>Application</th><th>Duration</th><th>Addiction</th><th>Summary</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in subcategory.items">
            <tr>
              <td>{{item.name}}</td><td>{{item['complexity/gp']}}</td><td>{{item.type}}</td><td>{{item.application}}</td><td>{{item.duration}}</td><td>{{item.addiction}}</td><td>{{item.summary}}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
`}

var gear_ware = { props: { subcategory: Object, categoryname: String, subcategoryname: String },
  template: `
    <div>
      <div class="ui divider"></div>
      <h3 class="ui header inverted" style="margin:0;">{{subcategoryname}}</h3>
      <span v-html="subcategory.text"></span>
      <table class="ui celled table inverted">
        <thead>
          <tr>
            <th>Name</th>
            <th>Complexity/GP</th>
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
              <td>{{item.name}}</td>
              <td>{{item['complexity/gp']}}</td>
              <td><i v-if="item.bioware" class="large green checkmark icon"></i></td>
              <td><i v-if="item.cyberware" class="large green checkmark icon"></i></td>
              <td><i v-if="item.hardware" class="large green checkmark icon"></i></td>
              <td><i v-if="item.meshware" class="large green checkmark icon"></i></td>
              <td><i v-if="item.nanoware" class="large green checkmark icon"></i></td>
              <td>{{item.summary}}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
`}
var gear_3 = `
	
`
var gear_4 = `
	
`
var gear_5 = `
	
`
var gear_6 = `
	
`
var gear_7 = `
	
`
var gear_8 = `
	
`
var gear_9 = `
	
`
var gear_10 = `
	
`
var gear_11 = `
	
`
var gear_12 = `
	
`
var gear_13 = `
	
`

var gear_templates = {
  "Comms":{
      "Communication Gear":gear_generic,
      "Neutrino Comms Gear":gear_generic,
      "Quantum Farcasters":gear_generic,
      "QE Comms Gear":gear_generic,
      "Mesh Hardware":gear_generic
  },
  "Creatures":{
      "GMOs":null,
      "Smart Animals":null,
      "Xenofauna":null
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
      "Bots":null,
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
      "Aircraft":null,
      "Exoskeletons":null,
      "Groundcraft":null,
      "Hardsuits":null,
      "Hybrids":null,
      "Nautical Craft":null,
      "Pers Transport":null,
      "Spacecraft":null
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