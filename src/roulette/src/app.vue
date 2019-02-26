<template>
	<div class="roulette" :style="[diameter]">
		<div class="roulette_roundel" :class="currState" :id="elId" :style="_roundelStyle()" @transitionend="_transEnd"
		 @webkitTransitionEnd="_transEnd">
			<span class="roulette_roundel--cover">
				<img v-if="coverUrl" width="100%" height="100%" :src="coverUrl" alt="">
			</span>
			<span v-if="test" class="roulette_roundel--subline --mid" :style="_sublineStyle(item)" v-for="(item,$index) in datum.mid"
			 :key="`m${$index}`"></span>
			<span v-if="test" class="roulette_roundel--subline --line" :style="_sublineStyle(item)" v-for="(item,$index) in datum.line"
			 :key="`l${$index}`"></span>
		</div>
		<div v-if="test" class="roulette_pointer--test"></div>
		<div class="roulette_pointer--image" @click="handleClick">
			<img :src="pointerUrl" alt="">
		</div>
	</div>
</template>
<script>
	//状态
	const STATE = {
		STATIC: 'static', //静止状态：默认，指针向上，旋转归零
		PLAY: 'play', //运行状态
		TRANS: 'trans', //过渡状态
		BRAKE: 'brake', //减速状态
		STOP: 'stop' //停止状态
	}
	//生成a到b之间且包括a和b的随机整数
	const randomRange = (a, b) => {
		let arr = a > b ? [b, a] : [a, b];
		return Math.floor(Math.random() * (arr[1] - arr[0] + 1)) + arr[0];
	}

	export default {
		name: 'Roulette',
		data() {
			return {
				el: null,
				elId: 0,
				currState: STATE.STATIC
			}
		},
		props: {
			//分块数据，块顺序无限制
			//name为块名，需唯一
			//degs为块的起始和结束角度，范围不可重合，可不连续
			datas: {
				type: Array,
				default () {
					return [{
						name: 'p1',
						degs: [30, 90]
					}, {
						name: 'p2',
						degs: [90, 150]
					}, {
						name: 'p3',
						degs: [150, 210]
					}, {
						name: 'p4',
						degs: [210, 270]
					}, {
						name: 'p5',
						degs: [270, 330]
					}, {
						name: 'p6',
						degs: [330, 390]
					}]
				}
			},
			//半径
			r: {
				type: Number,
				default: 100
			},
			//缓动距离,多少圈
			ease: {
				type: Number,
				default: 5 ////10圈,3600 
			},
			//转速，一圈多少秒
			speed: {
				type: Number,
				default: 1
			},
			//运行回调，返回当前STATE
			during: {
				type: Function,
				default: new Function()
			},
			//封面地址
			coverUrl: {
				type: String
			},
			//指针图片地址
			pointerUrl: {
				type: String
			},
			//是否为测试，测试将显示辅助线
			test: {
				type: Boolean,
				default: false
			},
			//避免视觉误差，在视觉上指针远离选中区域两侧边线的角度
			vague: {
				type: Number,
				default: 10
			},
			//可用性
			disabled: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			//辅助线基准点
			datum() {
				let midArr = [];
				let lineArr = [];
				this.datas.forEach((_item, index) => {
					let item = _item.degs;
					midArr.push(((item[0] + item[1]) / 2) % 360)
					lineArr.push(item[0], item[1])
				})
				return {
					mid: midArr,
					line: lineArr
				}
			},
			//直径
			diameter() {
				return {
					width: this.r * 2 + 'px',
					height: this.r * 2 + 'px'
				}
			}
		},
		methods: {
			handleClick(evt) {
				this.$emit('click', evt)
			},
			//开始运转
			play() {
				if (!this.disabled && (this.currState == STATE.STATIC || this.currState == STATE.STOP)) {
					this.reset();
					setTimeout(() => {
						this.currState = STATE.PLAY;
					}, 20)
				}
			},
			//减速，转动至目标块位置(对应datas里的name)
			brake(name) {
				if (this.currState == STATE.PLAY) {
					//获得目标块
					let currItem = this.datas.find((item, index) => {
						return item.name == name;
					})

					if (!currItem) {
						console.log('未找到目标奖品')
						return;
					}

					let currDegs = currItem.degs;
					//偏离vague度，避免视觉误差
					let randDeg = randomRange(currDegs[0] + this.vague, currDegs[1] - this.vague);
					//目标位置+缓动距离
					let deg = parseInt(Math.abs(this.ease)) * 360 + 360 - randDeg;
					//1圈1秒
					let time = (deg / 360 * this.speed).toFixed(2);
					this.currState = STATE.TRANS;
					setTimeout(() => {
						this.currState = STATE.BRAKE;
						this.el.style.cssText =
							`-webkit-transform:rotate(${deg}deg);
							-webkit-transition-duration:${time}s;
							transform:rotate(${deg}deg);
							transition-duration:${time}s`
					}, 20)
				}
			},
			//重置
			reset() {
				this.currState = STATE.STATIC;
			},
			_sublineStyle(item) {
				return `-webkit-transform:rotate(${item}deg) translateX(-50%);transform:rotate(${item}deg) translateX(-50%);`
			},
			_roundelStyle() {
				var fixTime = Math.max(this.speed - 0.15, 0.15)
				return this.currState == 'play' ? `-webkit-animation-duration: ${fixTime}s;animation-duration: ${fixTime}s;` : '';
			},
			_transEnd() {
				if (this.currState == STATE.BRAKE) {
					this.currState = STATE.STOP;
				}
			}
		},
		watch: {
			currState(after, before) {
				if (after == STATE.STATIC) {
					this.el.style.cssText = '';
				}
				this.during(after);
			}
		},
		created() {
			this.elId = `__roulette_${this._uid}_${new Date().getTime()}`;
		},
		mounted() {
			this.el = document.getElementById(this.elId);
		}
	}
</script>
<style scoped>
	.roulette {
		position: relative;
		border-radius: 50%;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		display: inline-block;
	}

	.roulette * {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
	}

	.roulette_roundel {
		position: relative;
		width: 100%;
		height: 100%;
		background-size: 100%;
		background-position: center;
		background-repeat: no-repeat;

	}

	.roulette_roundel--cover {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		z-index: 1;
		left: 0;
		top: 0;
	}

	.roulette_roundel--subline {
		position: absolute;
		display: inline-block;
		top: 0;
		left: 50%;
		height: 50%;
		transform-origin: 0% 100%;
		text-align: center;
		width: 1px;
		z-index: 9;
	}

	.roulette_roundel--subline.--line {
		border-top: 5px solid blue;
		background: #ddd;
	}

	.roulette_roundel--subline.--mid {
		border-top: 5px solid red;
		background-color: transparent;
	}


	.roulette_pointer--image {
		position: absolute;
		top: 50%;
		left: 40%;
		width: 20%;
		height: auto;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
		cursor: pointer;
	}

	.roulette_pointer--image img {
		width: 100%;
	}

	.roulette_pointer--test {
		position: absolute;
		width: 10px;
		height: 35%;
		left: 50%;
		top: 15%;
		-webkit-transform: translateX(-50%);
		transform: translateX(-50%);
		border-radius: 50% 50% 5px 5px;
		background-color: rgba(0, 0, 0, .75);
	}

	.roulette_pointer--test:after {
		content: '';
		position: absolute;
		width: 20px;
		height: 30px;
		display: inline-block;
		background-color: rgba(0, 0, 0, .75);
		bottom: -10px;
		left: -5px;
		border-radius: 50% 50% 10px 10px;
	}


	.static,
	.trans,
	.brake {
		-webkit-transform: rotate(0deg);
		-webkit-transition-property: -webkit-transform;
		-webkit-transition-timing-function: ease-out;
		transform: rotate(0deg);
		transition-property: transform;
		transition-timing-function: ease-out;
	}

	.play {
		-webkit-animation-name: play--rotate;
		-webkit-animation-iteration-count: infinite;
		-webkit-animation-timing-function: linear;
		animation-name: play--rotate;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	@-webkit-keyframes play--rotate {
		from {
			-webkit-transform: rotate(0deg)
		}

		to {
			-webkit-transform: rotate(360deg)
		}
	}

	@keyframes play--rotate {
		from {
			transform: rotate(0deg)
		}

		to {
			transform: rotate(360deg)
		}
	}
</style>
