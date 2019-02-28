import Roulette from './src/app.vue'
Roulette.install = function(Vue) {
	Vue.component(Roulette.name, Roulette);
}

export default Roulette
