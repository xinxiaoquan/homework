//解析CSS的主入口
var PJS=require("./parser.js");

var p=new PJS.HtmlParser;
var domTree=p.parse(`
<style>
	#box {
		width:300px;
		display:flex;
		justify-content:flex-end;
		align-items:flex-end;
	}
	#box .item {
		width:65px;
		height:20px;
		align-content:flex-start;
	}
	#box .d1 {
		height:50px;
		background-color:rgb( 100 , 100 , 100 );
	}
	#box .d2 {
		background-color:rgb( 200 , 50 , 10 );
	}
	#box .d3 {
		background-color:rgb( 40 , 200 , 150 );
	}
</style>
<div id="box">
	<div class="item d1"></div>
	<div class="item d2"></div>
	<div class="item d3"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
	<div class="item"></div>
</div>
`);


























