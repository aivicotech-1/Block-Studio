(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;root.StudioBlockLanguage=value;})(globalThis,function(){
  const alias=name=>String(name).trim().replace(/\s+/g,'_');
  function evaluate(source,values={},functions={}){
    const tokens=[];let at=0;
    const pattern=/\s*(?:(\d+(?:\.\d*)?(?:e[+-]?\d+)?|\.\d+)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|([A-Za-z_][A-Za-z0-9_.]*)|(==|!=|<=|>=|\*\*|[()+\-*/%,^<>]))/iy;
    while(at<source.length){if(!source.slice(at).trim())break;pattern.lastIndex=at;const m=pattern.exec(source);if(!m)throw Error('Invalid expression near '+source.slice(at,at+20));tokens.push(m[1]?{type:'number',value:Number(m[1])}:m[2]?{type:'string',value:m[2][0]==='"'?JSON.parse(m[2]):m[2].slice(1,-1).replace(/\\([\\'nrt])/g,(_,c)=>({n:'\n',r:'\r',t:'\t'}[c]||c))}:{type:'symbol',value:m[3]||m[4]});at=pattern.lastIndex;}
    let index=0;const peek=()=>tokens[index]?.value,take=()=>tokens[index++];
    const precedence={or:1,and:2,'==':3,'!=':3,'<':3,'>':3,'<=':3,'>=':3,'+':4,'-':4,'*':5,'/':5,'%':5,'^':6,'**':6};
    function expression(level=0,skip=false){
      const token=take();if(!token)throw Error('Expression is incomplete.');let left;
      if(token.type==='number'||token.type==='string')left=token.value;
      else if(['-','+','not'].includes(token.value)){const v=expression(token.value==='not'?3:6,skip);left=token.value==='not'?!v:token.value==='-'?-Number(v):Number(v);}
      else if(token.value==='('){left=expression(0,skip);if(take()?.value!==')')throw Error('Missing closing parenthesis.');}
      else if(/^[A-Za-z_]/.test(token.value)){
        const name=token.value;
        if(peek()==='('){take();const args=[];if(peek()!==')'){while(true){args.push(expression(0,skip));if(peek()!==',')break;take();}}if(take()?.value!==')')throw Error('Missing closing parenthesis.');if(!skip&&(!Object.hasOwn(functions,name)||typeof functions[name]!=='function'))throw Error('Unknown function: '+name);left=skip?0:functions[name](...args);}
        else if(['true','True','false','False'].includes(name))left=/^true$/i.test(name);
        else if(Object.hasOwn(values,name))left=values[name];else if(skip)left=0;else throw Error('Unknown variable: '+name);
      }else throw Error('Unexpected token: '+token.value);
      while(precedence[peek()]!==undefined&&precedence[peek()]>=level){const operator=take().value,p=precedence[operator],right=expression(p+(['^','**'].includes(operator)?0:1),skip||(operator==='and'&&!left)||(operator==='or'&&!!left));if(skip){left=0;continue;}switch(operator){case '+':left=typeof left==='string'||typeof right==='string'?String(left)+String(right):left+right;break;case '-':left=Number(left)-Number(right);break;case '*':left=Number(left)*Number(right);break;case '/':if(Number(right)===0)throw Error('Division by zero.');left=Number(left)/Number(right);break;case '%':left=Number(left)%Number(right);break;case '^':case '**':left=Number(left)**Number(right);break;case '==':left=left===right;break;case '!=':left=left!==right;break;case '<':left=left<right;break;case '>':left=left>right;break;case '<=':left=left<=right;break;case '>=':left=left>=right;break;case 'and':left=Boolean(left&&right);break;case 'or':left=Boolean(left||right);break;}}
      return left;
    }
    const value=expression();if(index!==tokens.length)throw Error('Unexpected text after expression.');if(typeof value==='number'&&!Number.isFinite(value))throw Error('Expression produced a non-finite number.');return value;
  }
  const opens=t=>/^(repeat |forever$|if |define )/.test(t);
  function tree(lines){const root=[],frames=[{body:root,node:null}];for(const t of lines){if(t==='end'){if(frames.length===1)throw Error('Unexpected end block.');frames.pop();continue;}if(t==='else'){const frame=frames.at(-1);if(!frame.node||!/^if /.test(frame.node.t)||frame.node.otherwise)throw Error('Else must follow an if block.');frame.node.otherwise=[];frame.body=frame.node.otherwise;continue;}const node={t};frames.at(-1).body.push(node);if(opens(t)){node.k=[];frames.push({body:node.k,node});if(frames.length>100)throw Error('Blocks are nested too deeply.');}}if(frames.length>1)throw Error('Add an end block for each repeat, forever, if, or define block.');return root;}
  function scripts(lines){const result=[];let current={kind:'flag',value:'',lines:[]},depth=0;function flush(){if(current.lines.length)result.push({...current,body:tree(current.lines)});}
    for(const line of lines){const t=line.trim();let match;if(depth===0&&(/^when green flag clicked$/.test(t)||/^when this sprite clicked$/.test(t)||(match=t.match(/^when key (.+) pressed$/))||/^when I receive (.+)$/.test(t))){flush();if(match)current={kind:'key',value:match[1],lines:[]};else if(t==='when this sprite clicked')current={kind:'click',value:'',lines:[]};else if(t.startsWith('when I receive '))current={kind:'message',value:t.slice(15),lines:[]};else current={kind:'flag',value:'',lines:[]};continue;}current.lines.push(t);if(opens(t))depth++;else if(t==='end')depth--;}
    flush();return result;
  }
  return {alias,evaluate,tree,scripts};
});
