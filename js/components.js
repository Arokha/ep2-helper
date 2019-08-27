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
  updated: function () {
    $(this.$el).find('table').tablesort();
  },
  template: `
    <div class="ui segment inverted">
      <div v-html="category.text"></div>
      <br><p><b>[Click any item's name for a full description.]</b></p>
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
        <div class="header" v-if="mytype_obj">{{mytype_obj.name}}</div>
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
              <td class="selectable" style="cursor:help;" v-on:click="modal_show(item)"><a>{{item.trait}}</a></td>
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
`
});

/** Filter to replace spaces and other strange characters with underscores. */
Vue.filter('despace', function (value) {
  if (!value) return '';
  return global_despace(value);
});
