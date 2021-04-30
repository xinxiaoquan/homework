//解析CSS布局页面类

class layout {
	constructor(dom) {
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
				
		this.mainSize=0;
		this.mainStart=0;
		this.mainEnd=0;
		this.mainSign=0;
		this.mainBase=0;
		this.crossSize=0;
		this.crossStart=0;
		this.crossEnd=0;
		this.crossSign=0;
		this.crossBase=0;
		
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
				if(itemStyles[this.crossSize] !== undefined)
					flexLine.crossSpace=Math.max(
					(flexLine.crossSpace||0), itemStyles[this.crossSize]);
				continue;
			}

			if(item.attrs && item.attrs.flex) {
				flexLine.push(item);
				flexLine.flexTotal++;
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
				mainSpace-=itemStyles[this.mainSize];
			}
			if(itemStyles[this.crossSize] !== undefined)
					flexLine.crossSpace=Math.max(
					(flexLine.crossSpace||0), itemStyles[this.crossSize]);
		}
		flexLine.mainSpace=mainSpace;
		this.mainAxisAlign(flexLine);
		flexLines.push(flexLine);
		
		this.flexLines=flexLines;
		/* for(var i=0; i<flexLines.length; i++)
			for(var j=0; j<flexLines[i].length; j++)
				console.log(flexLines[i][j].computedStype); */
	}
	getStyles(dom) {
		var styles={};
		for(var key in dom.computedStype) {
			let value=dom.computedStype[key].value;
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
			if(flexLine[j].attrs && flexLine[j].attrs.flex)
				itemStyles[this.mainSize]=flexLine[j].attrs.flex*scale;
			itemStyles[this.mainStart]=currentMain;
			itemStyles[this.mainEnd]=currentMain+itemStyles[this.mainSize]*this.mainSign;
			currentMain=itemStyles[this.mainEnd]+step;
			
			item.computedStype=itemStyles;
		}

	}
}

exports.layout=layout;






























