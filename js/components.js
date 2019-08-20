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
            <ul>
              <li v-for="mrate in morph.movement_rate">{{mrate.movement_type}} - {{mrate.base}} / {{mrate.full}}</li>
            </ul>
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