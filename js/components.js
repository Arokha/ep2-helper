  var chargen_message = {
    props: {
      step: Object
    },
    template: `
      <div class="ui message">
        <template v-for="section in step.guidance">
          <div class="header">{{section.heading}}</div>
          <p v-for="para in section.text" v-html="para"></p>
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
              <div class="ui segment inverted">MP: {{morph['cost']}}</div>
              <div class="ui segment inverted">AV: {{morph['availability']}}</div>
              <div class="ui segment inverted">WT: {{morph['wound threshold']}}</div>
              <div class="ui segment inverted">DUR: {{morph['durability']}}</div>
              <div class="ui segment inverted">DR: {{morph['death rating']}}</div>
            </div>
            <div class="ui horizontal stackable segments inverted">
              <div class="ui segment inverted">Insight: {{morph['pools']['Insight']}}</div>
              <div class="ui segment inverted">Moxie: {{morph['pools']['Moxie']}}</div>
              <div class="ui segment inverted">Vigor: {{morph['pools']['Vigor']}}</div>
              <div class="ui segment inverted">Flex: {{morph['pools']['Flex']}}</div>
            </div>
          </div>
      </div>
      <div class="extra content">
          <div class="header">Movement Types</div>
          <div class="description">
            <ul>
              <li v-for="mrate in morph['movement rate']">{{mrate['movement type']}} - {{mrate['base']}} / {{mrate['full']}}</li>
            </ul>
          </div>
      </div>
          <template v-if="morph['ware'].length">
            <div class="extra content">
              <div class="header">Included Ware</div>
              <div class="description">{{english_list(morph['ware'])}}</div>
            </div>
          </template>
          <template v-if="morph['morph traits'].length">
            <div class="extra content">
              <div class="header">Morph Traits</div>
              <div class="description">
                <ul>
                  <li v-for="trait in morph['morph traits']">{{trait.name}} - Level {{trait.level}}</li>
                </ul>
              </div>
            </div>
          </template>
          <template v-if="morph['common extras'].length">
            <div class="extra content">
              <div class="header">Common Extras</div>
              <div class="description">{{english_list(morph['common extras'])}}</div>
            </div>
          </template>
          <template v-if="morph['notes'].length">
            <div class="extra content">
              <div class="header">Additional Notes</div>
              <div class="description">{{english_list(morph['notes'])}}</div>
            </div>
          </template>
        </div>
      </div>
    `
  }

  var morphtype = {
    props: {
      desc: String,
      type: Array,
      idappend: String,
      active: Boolean
    },
    computed: {
      classes: function () {
        return this.active ? "ui tab segment inverted active" : "ui tab segment inverted"
      }
    },
    template: `
        <div :class="classes" :id="'morphs-'+ idappend" :data-tab="'morphs-'+ idappend">
          <div class="ui message">
            <div class="header"><slot></slot></div>
            <span v-html="desc"></span>
          </div>
          <br>
          <div class="ui three doubling cards inverted">
                <vcomp-morphcard v-for="morph in type" :morph="morph" :key="morph.name"></vcomp-morphcard>
            </div>
          </div>
    `,
    components: {
      vcompMorphcard: morphcard
    }
  }