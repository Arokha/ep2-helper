Vue.component('prop', {
	props: {
		obj: Object,
		keyname: String,
		classes: String,
		readonly: Boolean,
		multiline: Boolean
	},
	data() {
		let amnumber = isNumeric(this.obj[this.keyname]);
		return {amnumber};
	},
	computed: {
		myprop() {
			return this.obj[this.keyname];
		},
		trueclasses() {
			let always = "prop";
			if(this.classes){
				return always + " " + this.classes;
			}
			return always;
		}
	},
	methods: {
		update_content(event) {
			let typed = event.target.innerText;
			if(this.amnumber){
				typed = +typed;
				if(!isNumeric(typed)){
					event.target.innerText = this.myprop;
					return //We are a number and got NaN from the string. NaN is falsey.
				}
			}
			this.obj[this.keyname] = typed;
		},
		enterkey(event) {
			if(this.multiline){
				return;
			}
			event.preventDefault();
			event.target.innerText = event.target.innerText.replace(/(\r\n|\n|\r)/gm,"");
			event.target.blur();
		},
		clicked(event) {
			if(!this.readonly){
				event.stopPropagation();
			}
		},
		roll(event) {
			if(vue_sheet){
				let parsed = parse_dice(this.myprop);
				if(!parsed){
					return;
				}

				event.preventDefault();
				event.stopPropagation();
				$("#custom-reason").val("Clicked '"+this.myprop+"'");
				$("#custom-dice").val(String(this.myprop));
				vue_sheet.custom_roll();
			}
		}
	},
	watch: {
		myprop(newValue,oldValue) {
			this.$el.innerText = newValue;
		}
	},
	template: `
	<span spellcheck="false" :data-number="amnumber" :class="trueclasses" :contentEditable="!readonly" @click.exact="clicked" @click.ctrl.exact="roll" @blur="update_content" @keyup.enter="enterkey">{{myprop}}</span>
	`
});

Vue.component('sheet-infobox', {
	props: {
		header: String
	},
	methods: {
		hide_content() {
			$(this.$el).find(".sheetcontent").transition({
				animation: 'fade down',
				onShow: function(){icon_swap(this, "maximize", "minimize");},
				onHide: function(){icon_swap(this, "minimize", "maximize");}
			});
		}
	},
	mounted() {
    	this.$nextTick(function(){
      		$(this.$el).find('table.sortable').tablesort();
      		$(this.$el).find('[data-content]').popup();
    	});
  	},
	template: `
	  	<div class="ui segment inverted">
			<!-- <a class="ui top left attached large secondary inverted label"><i style="margin:0px;" class="large pencil icon"></i></a> -->
			<a class="ui top right attached large secondary inverted label" v-on:click="hide_content()"><i style="margin:0px;" class="large window minimize icon"></i></a>
			<h2 class="ui top attached center aligned inverted teal header" style="padding:0px;">{{header}}</h2>
			<div class="sheetcontent" style="margin-top:5px!important;">
				<slot></slot>
			</div>
		</div>
  `
});

Vue.component('sheet-modal-link', {
	props: {
		title: String,
		contentplain: String,
		contenthtml: String,
		compname: String,
		compobj: Object,
		compattr: String
	},
	data() {
		return {mymodal: null};
	},
	methods: {
		modal_show() {
			if(!this.mymodal){
				this.mymodal = $(this.$el).find(".modal");
			}
			this.mymodal.modal('show');
		}
	},
	template: `
		<span style="cursor: pointer;">
			<a v-on:click="modal_show()"><slot></slot></a>
			<div class="ui inverted modal">
      			<div class="header">{{title}}</div>
      			<div v-if="contenthtml" class="scrolling content" v-html="contenthtml"></div>
      			<div v-if="compname">
      				<component :is="compname" :[compattr]="compobj"></component>
      			</div>
      			<div v-else class="scrolling content">{{contentplain}}</div>
    		</div>
		</span>
	`
});
