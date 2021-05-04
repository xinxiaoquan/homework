var images=require("images");
//解析CSS布局页面类

class layout {
	init(dom) {
		if(!dom.computedStype)
			return;
		this.domStyles=this.getStyles(dom);
		if(this.domStyles.display &&
			this.domStyles.display!="flex") {
			return false;
		}
		if(!this.domStyles.width ||
			this.domStyles.width=="auto")
			this.domStyles.width=null;
		if(!this.domStyles.height ||
			this.domStyles.height=="auto")
			this.domStyles.height=null;
		var children=dom.children;
		var items=[];
		if(children)
			for(var key in children)
				if(!children[key].content)
					items.push(children[key]);
		items.sort((a,b)=>{
			return (a||0)-(b||0);
		});
		if(!this.domStyles["flex-direction"] ||
				this.domStyles["flex-direction"]=="auto")
				this.domStyles["flex-direction"]="row";
		if(!this.domStyles["align-items"] ||
				this.domStyles["align-items"]=="auto")
				this.domStyles["align-items"]="stretch";
		if(!this.domStyles["justify-content"] ||
				this.domStyles["justify-content"]=="auto")
				this.domStyles["justify-content"]="flex-start";
		if(!this.domStyles["flex-wrap"] ||
				this.domStyles["flex-wrap"]=="auto")
				this.domStyles["flex-wrap"]="nowrap";
		if(!this.domStyles["align-content"] ||
				this.domStyles["align-content"]=="auto")
				this.domStyles["align-content"]="stretch";
				
		this.mainSize="";
		this.mainStart="";
		this.mainEnd="";
		this.mainSign="";
		this.mainBase="";
		this.crossSize="";
		this.crossStart="";
		this.crossEnd="";
		this.crossSign="";
		this.crossBase="";
		
		if(this.domStyles["flex-direction"]=="row") {
			this.mainSize="width";
			this.mainStart="left";
			this.mainEnd="right";
			this.mainSign=+1;
			this.mainBase=0;

			this.crossSize="height";
			this.crossStart="top";
			this.crossEnd="bottom";
		}
		if(this.domStyles["flex-direction"]=="row-reverse") {
			this.mainSize="width";
			this.mainStart="right";
			this.mainEnd="left";
			this.mainSign=-1;
			this.mainBase=this.domStyles.width;
			
			this.crossSize="height";
			this.crossStart="top";
			this.crossEnd="bottom";
		}
		if(this.domStyles["flex-direction"]=="column") {
			this.mainSize="height";
			this.mainStart="top";
			this.mainEnd="bottom";
			this.mainSign=+1;
			this.mainBase=0;
			
			this.crossSize="width";
			this.crossStart="left";
			this.crossEnd="right";
		}
		if(this.domStyles["flex-direction"]=="column-reverse") {
			this.mainSize="height";
			this.mainStart="bottom";
			this.mainEnd="top";
			this.mainSign=-1;
			this.mainBase=this.domStyles.height;
			
			this.crossSize="width";
			this.crossStart="left";
			this.crossEnd="right";
		}
		if(this.domStyles["flex-wrap"]=="warp-reverse") {
			var tmp=this.crossStart;
			this.crossStart=this.crossEnd;
			this.crossEnd=tmp;
			this.crossSign=-1;
		} else {
			this.crossBase=0;
			this.crossSign=+1;
		}

		var flexLine=[];
		flexLine.flexTotal=0;
		var flexLines=[];
		var isAutoMainsize=false;
		if(!this.domStyles[this.mainSize] ||
				this.domStyles[this.mainSize]=="auto") {
			this.domStyles[this.mainSize]=0;
			isAutoMainsize=true;
		}

		var mainSpace=this.domStyles[this.mainSize];
		for(var i=0; i<items.length; i++) {
			let item=items[i];
			let itemStyles=this.getStyles(item);
			if(!itemStyles[this.mainSize] ||
				 itemStyles[this.mainSize]=="auto")
				 itemStyles[this.mainSize]=0;
			if(!itemStyles[this.crossSize] ||
				 itemStyles[this.crossSize]=="auto")
				 itemStyles[this.crossSize]=0;
			if(isAutoMainsize) {
				this.domStyles[this.mainSize]+=itemStyles[this.mainSize];
				flexLine.push(item);
				item.computedStype=itemStyles;
				flexLine.crossSpace=Math.max(
					(flexLine.crossSpace||0), (itemStyles[this.crossSize]||0));
				continue;
			}

			if(itemStyles["flex"]) {
				flexLine.push(item);
				item.computedStype=itemStyles;
				flexLine.flexTotal+=Number(itemStyles["flex"]);
			} else {
				if(itemStyles[this.mainSize]>this.domStyles[this.mainSize])
					itemStyles[this.mainSize]=this.domStyles[this.mainSize];

				if(mainSpace<itemStyles[this.mainSize]) {
					flexLine.mainSpace=mainSpace;
					//计算主轴的对齐方式
					this.mainAxisAlign(flexLine);
					flexLines.push(flexLine);
					mainSpace=this.domStyles[this.mainSize];
					flexLine=[];
					flexLine.flexTotal=0;
					i--;
					continue;
				}
				flexLine.push(item);
				item.computedStype=itemStyles;
				mainSpace-=itemStyles[this.mainSize];
			}
			flexLine.crossSpace=Math.max(
				(flexLine.crossSpace||0), (itemStyles[this.crossSize]||0));
		}
		flexLine.mainSpace=mainSpace;
		this.mainAxisAlign(flexLine);
		flexLines.push(flexLine);
		//计算交叉轴的对齐方式
		this.crossAxisAlign(this.domStyles, flexLines);
		//最终计算的结果
		return flexLines;
	}
	//设置渲染的视口尺寸
	setViewportSize(width, height) {
		this.viewport=images(width, height);
		this.viewport.fill(255,255,255);
	}
	//渲染图片
	print(dom) {
		if(dom instanceof Array) {
			for(var i=0; i<dom.length; i++)
				this.print(dom[i]);
			return false;
		}
		if(!dom || !dom.computedStype
			|| !this.viewport)
			return false;
		var img=images(dom.computedStype.width, dom.computedStype.height);
		if(dom.computedStype["background-color"]) {
			var r="",g="",b="";
			var state=start;
			for(var i=0; i<dom.computedStype["background-color"].length; i++) {
				state=state(dom.computedStype["background-color"][i]);
			}
			function start(c) {
				if(c=="(") return getR;
				return start;
			}
			function getR(c) {
				if(c==",") return getG;
				if(c!=" ") r+=c;
				return getR;
			}
			function getG(c) {
				if(c==",") return getB;
				if(c!=" ") g+=c;
				return getG;
			}
			function getB(c) {
				if(c==")") return end;
				if(c!=" ") b+=c;
				return getB;
			}
			function end() {
				return end;
			}
			img.fill(r*1,g*1,b*1);
		} else img.fill(randomColor(),randomColor(),randomColor());
		this.viewport.draw(img, dom.computedStype.left, dom.computedStype.top);
		
		function randomColor() {
			return Math.random()*201+100;
		}
	}
	//保存图片
	saveImg(imgPath) {
		if(this.viewport)
			this.viewport.save(imgPath);
	}
	getStyles(dom) {
		var styles={};
		for(var key in dom.computedStype) {
			let value=dom.computedStype[key].value;
			if(!value) return dom.computedStype;
			if(value.toString().match(/px$/))
				value=parseInt(value);
			if(!isNaN(value)) value=Number(value);
			styles[key]=value;
		}
		return styles;
	}
	//主轴的对齐方式
	mainAxisAlign(flexLine) {
		var currentMain=this.mainBase;
		var step=0;
		var scale=1;
		if(this.domStyles["justify-content"]=="flex-start");
		if(this.domStyles["justify-content"]=="flex-end")
			currentMain=this.mainBase+this.mainSign*flexLine.mainSpace;
		if(this.domStyles["justify-content"]=="center")
			currentMain=this.mainBase+this.mainSign*(flexLine.mainSpace/2);
		if(this.domStyles["justify-content"]=="space-between")
			step=flexLine.mainSpace/(flexLine.length-1)*this.mainSign;
		if(this.domStyles["justify-content"]=="space-around") {
			step=flexLine.mainSpace/(flexLine.length)*this.mainSign;
			currentMain=step/2+this.mainBase;
		}
		if(flexLine.flexTotal) {
			scale=flexLine.mainSpace/flexLine.flexTotal;
			currentMain=0;
			step=0;
		}
		for(var j=0; j<flexLine.length; j++) {
			let item=flexLine[j];
			let itemStyles=this.getStyles(item);
			if(itemStyles["flex"])
				itemStyles[this.mainSize]=itemStyles["flex"]*scale;
			itemStyles[this.mainStart]=currentMain;
			itemStyles[this.mainEnd]=currentMain+itemStyles[this.mainSize]*this.mainSign;
			currentMain=itemStyles[this.mainEnd]+step;
			
			item.computedStype=itemStyles;
		}
	}
	//交叉轴的对齐方式
	crossAxisAlign(domStyles, flexLines) {
		var autoCrossSize=false;
		if(!domStyles[this.crossSize]) {
			domStyles[this.crossSize]=0;
			autoCrossSize=true;
		}
		var crossSpace=domStyles[this.crossSize];
		for(var i=0; i<flexLines.length; i++) {
			if(autoCrossSize) {
				domStyles[this.crossSize]+=flexLines[i].crossSpace;
				continue;
			}
			crossSpace-=flexLines[i].crossSpace;
		}
		if(domStyles["flex-wrap"]=="wrap-reverse") {
			this.crossBase=domStyles[this.crossSize];
		} else this.crossBase=0;
		var step=0;
		if(domStyles["align-content"]=="flex-start");
		if(domStyles["align-content"]=="flex-end")
			this.crossBase+=this.crossSign*crossSpace;
		if(domStyles["align-content"]=="center")
			this.crossBase+=this.crossSign*crossSpace/2;
		if(domStyles["align-content"]=="space-between")
			step=crossSpace/(flexLines.length-1);
		if(domStyles["align-content"]=="space-around") {
			step=crossSpace/(flexLines.length);
			this.crossBase+=this.crossSign*step/2;
		}
		if(domStyles["align-content"]=="stretch");

		for(var i=0; i<flexLines.length; i++) {
			var items=flexLines[i];
			var lineCrossSize=
				domStyles["align-content"]=="stretch"?
					items.crossSpace+crossSpace/flexLines.length:
					items.crossSpace;
			for(var j=0; j<items.length; j++) {
				var item=items[j];
				var itemStyles=this.getStyles(item);
				var align=itemStyles["align-self"]||domStyles["align-items"];
				if(!itemStyles[this.crossSize] && align=="stretch")
					itemStyles[this.crossSize]=lineCrossSize;
				if(align=="flex-start") {
					itemStyles[this.crossStart]=this.crossBase;
					itemStyles[this.crossEnd]=itemStyles[this.crossStart]+this.crossSign*itemStyles[this.crossSize];
				}
				if(align=="flex-end") {
					itemStyles[this.crossEnd]=this.crossBase+this.crossSign*lineCrossSize;
					itemStyles[this.crossStart]=itemStyles[this.crossEnd]-this.crossSign*itemStyles[this.crossSize];
				}
				if(align=="center") {
					itemStyles[this.crossStart]=this.crossBase+this.crossSign*(lineCrossSize-itemStyles[this.crossSize])/2;
					itemStyles[this.crossEnd]=itemStyles[this.crossStart]+this.crossSign*itemStyles[this.crossSize];
				}
				if(align=="stretch") {
					itemStyles[this.crossStart]=this.crossBase;
					itemStyles[this.crossEnd]=this.crossBase+this.crossSign*(itemStyles[this.crossSize]||lineCrossSize);
					itemStyles[this.crossSize]=this.crossSign*(itemStyles[this.crossEnd]-itemStyles[this.crossStart]);
				}

				item.computedStype=itemStyles;
			}
			this.crossBase+=this.crossSign*(lineCrossSize+step);
		}
	}
}

exports.layout=layout;






























