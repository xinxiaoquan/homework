//解析CSS布局页面类

class layout {
	constructor(dom) {
		if(!dom.computedStype)
			return;
		var styles=this.getStyles(dom);
		if(styles.display &&
			styles.display!="flex") {
			return false;
		}
		if(!styles.width ||
			styles.width=="auto")
			styles.width=null;
		if(!styles.height ||
			styles.height=="auto")
			styles.height=null;
		var chilren=dom.children;
		var items=[];
		if(children)
			for(var key in children)
				if(!children[key].content)
					items.push(children[key]);
		items.sort((a,b)=>{
			return (a||0)-(b||0);
		});
		if(!styles["flex-direction"] ||
				styles["flex-direction"]=="auto")
				styles["flex-direction"]="row";
		if(!styles["align-items"] ||
				styles["align-items"]=="auto")
				styles["align-items"]="stretch";
		if(!styles["justify-content"] ||
				styles["justify-content"]=="auto")
				styles["justify-content"]="flex-start";
		if(!styles["flex-wrap"] ||
				styles["flex-wrap"]=="auto")
				styles["flex-wrap"]="nowrap";
		if(!styles["align-content"] ||
				styles["align-content"]=="auto")
				styles["align-content"]="stretch";
		var mainSize,mainStart,mainEnd,mainSign,mainBase,
			crossSize,crossStart,crossEnd,crossSign,crossBase;
		if(styles["flex-direction"]=="row") {
			mainSize="width";
			mainStart="left";
			mainEnd="right";
			mainSign=+1;
			mainBase=0;
			
			crossSize="height";
			crossStart="top";
			crossEnd="bottom";
		}
		if(styles["flex-direction"]=="row-reverse") {
			mainSize="width";
			mainStart="right";
			mainEnd="left";
			mainSign=-1;
			mainBase=styles.width;
			
			crossSize="height";
			crossStart="top";
			crossEnd="bottom";
		}
		if(styles["flex-direction"]=="column") {
			mainSize="height";
			mainStart="top";
			mainEnd="bottom";
			mainSign=+1;
			mainBase=0;
			
			crossSize="width";
			crossStart="left";
			crossEnd="right";
		}
		if(styles["flex-direction"]=="column-reverse") {
			mainSize="height";
			mainStart="bottom";
			mainEnd="top";
			mainSign=-1;
			mainBase=styles.height;
			
			crossSize="width";
			crossStart="left";
			crossEnd="right";
		}
		if(styles["flex-wrap"]=="warp-reverse") {
			var tmp=crossStart;
			crossStart=crossEnd;
			crossEnd=tmp;
			crossSign=-1;
		} else {
			crossBase=0;
			crossSign=+1;
		}
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
}

exports.layout=layout;






























