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

Vue.component('info-modal', {
  props: {
    id: String,
    title: String,
    content: String
  },
  template: `
    <div :id="id" class="ui inverted modal">
      <div class="header">{{title}}</div>
      <div class="scrolling content" v-html="content"></div>
    </div>
  `
});

var chargen_message = {
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
}

var gear_category_tab = {
  props: {
    category: Object,
    categoryname: String
  },
  methods: {
	  scrollToTop: function() {
		  window.scrollTo({top:0});
	  }
  },
  template: `
	<a class="item" :data-tab="'geartab-'+categoryname" v-on:click="scrollToTop">
		{{categoryname}}
		<div class="menu">
			<div class="ui divider"></div>
			<a v-for="(thekey,subcatname) in category.subcategories" class="item" :href="'#'+subcatname | despace" v-on:click.stop style="text-align: right;">{{subcatname}}</a>
		</div>
	</a>`
}  

var gear_subcategory = {
  props: {
    subcategory: Object,
    categoryname: String,
    subcategoryname: String
  },
  computed: {
    mytemplate: function() {
      if(gear_templates[this.categoryname] && gear_templates[this.categoryname][this.subcategoryname]){
        return gear_templates[this.categoryname][this.subcategoryname];
      } else {
        return gear_fallback;
      }
    }
  },
  template: `
    <div :is="mytemplate" :subcategory="subcategory" :categoryname="categoryname" :subcategoryname="subcategoryname"></div>
  `
}

var gear_category_body = {
  props: {
    category: Object,
    categoryname: String
  },
  components: {
    vcompSubcategory: gear_subcategory
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
    <div class="ui tab segment inverted" :data-tab="'geartab-'+categoryname" :id="'geartab-'+categoryname | despace">
      <div v-html="category.text"></div>
      <br><p><b>[Click any item's name for a full description.]</b></p>
      <vcomp-subcategory v-for="(subobj, subname) in category.subcategories" :subcategory="subobj" :categoryname="categoryname" :subcategoryname="subname" :key="subname"></vcomp-subcategory>
    </div>
    `
}

var morphcard = {
  props: {
    morph: Object
  },
  methods: {
    english_list: function (arr) {
        return arr.join(", ");
      }
  },
  template: `
    <div class="ui centered card"">
      <div class="content">
        <div class="morph-pic">
          <img v-if="morph.image" :src="'images/morphs/'+morph.image">
          <img v-else src="images/morphs/none.png">
        </div>
        <div class="header">{{morph.name}}</div>
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
    <div class="extra content">
        <div class="header">Movement Types</div>
        <div class="description">
          <movement-types :types="morph.movement_rate"></movement-types>
        </div>
    </div>
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
                <li v-for="trait in morph.morph_traits">{{trait.name}} - Level {{trait.level}}</li>
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
        <template v-if="morph.notes.length">
          <div class="extra content">
            <div class="header">Additional Notes</div>
            <div class="description">{{english_list(morph.notes)}}</div>
          </div>
        </template>
      </div>
    </div>
  `
}

var morphtype = {
  props: {
    morphs: Array,
    morph_types: Array,
    mytype: String,
    active: Boolean,
    idappend: String
  },
  computed: {
    mymorphs: function() {
       let actual_mytype = this.mytype;
       return this.morphs.filter(function(element){
        return element.type == actual_mytype;
      });
    },
    mytype_obj: function() {
      let actual_mytype = this.mytype;
      return this.morph_types.find(function(element){
        return element.name == actual_mytype;
      });
    },
    classes: function () {
      return this.active ? "ui tab segment inverted active" : "ui tab segment inverted"
    }
  },
  template: `
      <div :class="classes" :id="'morphs-'+ idappend" :data-tab="'morphs-'+ idappend">
        <div class="ui message">
          <div class="header">{{mytype}}</div>
          <span v-if="mytype_obj" v-html="mytype_obj.description"></span>
        </div>
        <br>
        <div class="ui three doubling cards inverted">
              <vcomp-morphcard v-for="morph in mymorphs" :morph="morph" :key="morph.name"></vcomp-morphcard>
          </div>
        </div>
  `,
  components: {
    vcompMorphcard: morphcard
  }
}

var trait_table = { props: { traits: Array },
  methods: {
    modal_show: function(item) {
      $("#"+item.id).modal('show');
    }
  },
  template: `
    <div>
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
              <td style="cursor:help;" v-on:click="modal_show(item)"><a>{{item.trait}}</a></td>
              <td class="single line">{{item['cost']}}</td>
              <td><i v-if="item.ego" class="large green checkmark icon"></i></td>
              <td><i v-if="item.morph" class="large green checkmark icon"></i></td>
              <td>{{item.summary}}</td>
            </tr>
            <info-modal :id="item.id" :title="item.trait" :content="item.description"></info-modal>
          </template>
        </tbody>
      </table>
    </div>
`}

/** Filter to replace spaces and other strange characters with underscores. */
Vue.filter('despace', function (value) {
  if (!value) return '';
  value = value.toString();
  return value.replace(/[^#A-Za-z0-9]/, "_");;
});
