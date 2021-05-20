var syntax={
	program:[["StatementList"]],
	StatementList:[
		["StatementList"],
		["Statement"]
	],
	Statement:[
		["IfStatement"],
		["FunctionDeclaration"],
		["VariableDeclaration"],
		["ExpressionStatement"]
	],
	IfStatement:[
		["if","(","ExpressionStatement",")","StatementList"]
	],
	FunctionDeclaration:[
		["function","Literal","(",")","{","StatementList","}"]
	],
	VariableDeclaration:[
		["var","Literal"]
	],
	ExpressionStatement:[
		["AdditiveExpression"]
	],
	AdditiveExpression:[
		["MultiplicativeExpression"],
		["AdditiveExpression","+","MultiplicativeExpression"],
		["AdditiveExpression","-","MultiplicativeExpression"]
	],
	MultiplicativeExpression:[
		["PrimaryExpression"],
		["MultiplicativeExpression","*","PrimaryExpression"],
		["MultiplicativeExpression","/","PrimaryExpression"]
	],
	PrimaryExpression:[
		["(","ExpressionStatement",")"],
		["Literal"],
		["Identifier"]
	],
	Literal:[
		["Number"],
		["Boolean"],
		["String"],
		["Null"]
	],
	Identifier:[
		
	]
}

var end={
	isEnd:true
}

var start={
	AdditiveExpression:end
};

function closure(state) {
	var queue=[];
	for(var key in state)
		queue.push(key);

	while(queue.length) {
		var symbol=queue.shift();
		if(syntax[symbol]) {
			var arr=syntax[symbol];
			for(var k in arr) {
				if(!state[arr[k][0]]) {
					state[arr[k][0]]=true;
					queue.push(arr[k][0]);
				}
				var current=state;
				var arr2=arr[k];
				for(var i=0;i<arr2.length;i++) {
					if(!(current[arr2[i]] instanceof Object))
						current[arr2[i]]={};
					current=current[arr2[i]];
				}
				current.isRuleEnd=true;
			}
		}
	}
}

closure(start);

console.log(JSON.stringify(start,null, "  "));





































