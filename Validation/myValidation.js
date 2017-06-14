//
//
// option={
// 	el:'表单element',            //表单 dom
//
// 	model:{                      //表单数据模型 规则
// 		'username':{
// 			required:true,       //是否必须 
// 			pattern:/[a-z]{5-9}/,//正则匹配
//			confirm:''           //与某一字段重复，常见密码确认 ，dom
// 			notice:{             //错误提示，object||string
// 				required:'username is required',
// 				pattern:'username error format'
// 			},
// 			ajax:{               //服务器验证
// 				url:'xxx',
//				method:post,
//				name:'code',	 //返回字段名称
// 				code:{           //不同错误码对应错误提示
// 					error:{'400':'username error'},
//					success:['200']
// 				}
// 			}
// 		}
// 	},
//
// 	inline:false,                //是否同一行显示  默认在下方
// 	submitButton:'提交按钮',
//	className:'validate-notice', //提示的dom元素class
//	disableButtons:[{el:el,rules:['name','password']}]
// }

//Pollyfill
if (!Object.assign) {
  Object.defineProperty(Object, "assign", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      "use strict";
      if (target === undefined || target === null)
        throw new TypeError("Cannot convert first argument to object");
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) continue;
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
        }
      }
      return to;
    }
  });
}


const DEFAULTOPTION={
	inline:false,
	className:'validate-notice',
};


let debounce=(function (){
	let deb=false;
	let timeout;

	return (function(fn){

		if(timeout){
			clearTimeout(timeout);
		};

		timeout=setTimeout(function(){
			fn();
			deb=true;
		},500);
	});
})();

var Ajax={
    get: function (url,data,fn){
    	var query='?';
    	if(typeof data == 'object'){
    		for(let d in data){
    			query=query+d+'='+data[d]+'&'
    		}
    	}
    	query=query.substr(0,query.length-1);

        var obj=new XMLHttpRequest();  // XMLHttpRequest对象用于在后台与服务器交换数据          
        obj.open('GET',url+query,false);
        obj.onreadystatechange=function(){
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState==4说明请求已完成
                fn.call(this, obj.responseText);  //从服务器获得数据
            }
        };
        obj.send(null);
    },
    post: function (url, data, fn) {
        var obj = new XMLHttpRequest();
        obj.open("POST", url, false);
        obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // 发送信息至服务器时内容编码类型
        obj.onreadystatechange = function () {
            if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
                fn.call(this, obj.responseText);
            }
        };
        var d='';
        for(var key in data){
        	d+=`${key}=${data[key]}&`
        }
        d=d.substr(0,d.length-1);
        obj.send(d);
    }
}


class Validation {

	constructor(option){
		//哪些数据是非法
		this.illegalArray=[];
		this.option=Object.assign({},DEFAULTOPTION,option);
		this.inputs=this.option.el.querySelectorAll('[name]');
		this.init();
	}

	init(){

				this.disableEvent=document.createEvent('CustomEvent');
				this.enableEvent=document.createEvent('CustomEvent');
				this.disableEvent.initCustomEvent('disable',true,true,{});
				this.enableEvent.initCustomEvent('enable',true,true,{});

			if(this.option.submitButton){
				this.option.submitButton.addEventListener('disable', function(e){
					this.setAttribute('disabled',true);
				});
				this.option.submitButton.addEventListener('enable', function(e){
					this.removeAttribute('disabled');
				});
			}




			for(let i=0; i<this.inputs.length; i++){
				//为每个input添加id标记
				this.inputs[i].validate_id=i;
				if(this.option.disableButtons){
					this.option.disableButtons.map( (a) => {
						a.el.addEventListener('disable',function(e){
							this.setAttribute('disabled',true);
						});
						a.el.addEventListener('enable',function(e){
							this.removeAttribute('disabled');
						})
						for(let o=0; o<a.rules.length; o++){
							if(a.rules[o] == this.inputs[i].name){
								a.rules[o]=i;
							}
						}
					})
				}
				let eventType='keyup';
				switch (this.inputs[i].type){
					case 'checkbox':
						eventType='click';
						break;
					case 'select':
						eventType='change';
						break;
					default:
						eventType='keyup';		
				}

				let check=(e) => {
					debounce(() => {
						let result=this.validateData(this.inputs[i],this.option.model[this.inputs[i].name]);
						if(result.validate){
							this.removeValidateNotice(this.inputs[i]);
						}else{
							this.validateNotice(this.inputs[i],result.notice);
						}

					});
				}

				this.inputs[i].dataset.eventtype=eventType;
				this.inputs[i].addEventListener(eventType,check);
				this.inputs[i].addEventListener('change',check);
			}

			

		// this.option.submitButton&&this.option.submitButton.addEventListener('click', (e) => {

		// 	if(!this.validateForm(true)){
		// 		e.preventDefault();
		// 	}

		// });

		this.validateForm()

	}

	//验证数据是否合法
	validateData(el,model){
		let validate=true,
			a=el,
			m=model,
			errType='',
			notice='';

	      //是否需要验证
	      if(!m){
	      	return {validate};
	      //如果必填并且值为空
	      }else if(m.required&&a.value.toString().length<=0){

	        validate=false;
	        errType='required';

	      //如果不是必填  
	      }else if(!m.required){

	        //值不为空则验证
	        if(a.value.toString().length>0){
	          
	          //如果有正则表达式则验证正则
	          if(m.pattern){
	            let reg=new RegExp(m.pattern);
	            if(!reg.test(a.value)){
	              validate=false;
	              errType='pattern';
	            }

	          //否则验证type  
	          }else if(m.type){
	            if(typeof a.value != m.type){
	              validate=false;
	              errType='type';
	            }
	          }

	        }

	      //如果必填，并且值不为空  
	      }else{

	        //如果有正则表达式则验证正则
	        if(m.pattern){
	          let reg=new RegExp(m.pattern);
	          if(!reg.test(a.value)){
	            validate=false;
	            errType='pattern';
	          }
	        }else if(m.type){
	          if(typeof a.value != m.type){
	            validate=false;
	            errType='pattern';
	          }
	        }

	      }

	      // if(m.value){
	      // 	if(typeof m.value == 'object'){

	      // 	}
	      // }

	      if(m.confirm){
	      	if(m.confirm.value != a.value){
	      		validate=false;
	      		errType='confirm';
	      	}

	      	// 如果是第一次输入，对相同值添加事件
	      	if(!m.confirm.dataset.first){
	      		m.confirm.dataset.first='true';

	      		m.confirm.addEventListener(m.confirm.dataset.eventtype, (e) => {
	      		debounce( () => {
	      			let result=this.validateData(a,m);
	      			if(result.validate){
	      				this.removeValidateNotice(a)
	      			}else{
	      				this.validateNotice(a,result.notice);
	      			}
	      		})
	      		})
	      	}

	      	
	      }

	      //本地验证完毕后
	      if(validate){
	      	if(m.ajax){
	      		//如果服务器验证不通过
	      			let result=this.serverValidate(a,m);
		      		if(!result.illegal){
		      			validate=false;
		      			notice=result.notice;
		      		}

	      			

	      	}

	      }else{
	      	if(typeof m.notice == 'object'){
	      		notice=m.notice[errType];
	      	}else{
	      		notice=m.notice;
	      	}
	      }


	     	if(validate){
				this.illegalArray[a.validate_id]=true;
				let allIllegal=this.illegalArray.every(function(a){
					if(a){
						return a == true;
					}else{
						return false;
					}
				});
				if(allIllegal){
					this.option.submitButton&&this.option.submitButton.dispatchEvent(this.enableEvent);
				}
			}else{
				this.illegalArray[a.validate_id]=false;
				this.option.submitButton&&this.option.submitButton.dispatchEvent(this.disableEvent);
			}	


	    		
	
		this.checkAllValidate();							

	    return {validate,notice};
	}

	serverValidate(el,model){
		let result={};
			Ajax[model.ajax.method](model.ajax.url,{[el.name]:el.value},(res) => {
				let notice;
				let code=model.ajax.code;
				if(code.success){
					let success=false;
					code.success.map( (a) => {
						if(a == model.ajax.name?JSON.parse(res)[model.ajax.name]:JSON.parse(res)){
							success=true;
						}
					});
					if(!success){
						notice='';
					}
				}

				if(code.error){
					notice=code.error[model.ajax.name?JSON.parse(res)[model.ajax.name]:JSON.parse(res)];
				}

				if(notice&&notice.length>0){
					// this.validateNotice(el,notice);
					result={illegal:false,notice}
				}else{
					// this.removeValidateNotice(el);
					result={illegal:true}
				}

			});

			return result;	
	}


	//根据数据模型对整个表单进行验证
	validateForm(hasNotice){
		let {model}=this.option;

	    //取得所有元素
	    let inputs=this.inputs;
	    let allValidate=true;


	    //inputs为nodelist，在ie下用foreach会报错
	    for(let i=0; i<inputs.length; i++){

	      let a=inputs[i];
	      let m=model[a.name];


	      // 验证完毕
	      let result=this.validateData(a,m);
	      if(!result.validate){
	        if(allValidate){
	          allValidate=false;
	        }

	        if(hasNotice){
	        	this.validateNotice(a,result.notice);
	        }

	      }else{
	      	this.removeValidateNotice(a);
	      }

	    }

	    return allValidate;
	}


	checkAllValidate(){
		if(!this.option.disableButtons) return;
		this.option.disableButtons.map( (a) => {
			let all=true;
			a.rules.map( (b) => {
				if(this.illegalArray[b] == false) all=false;
			})
			if(all&&a.el.dataset.forcedisable!='true'){
				a.el.dispatchEvent(this.enableEvent);
			}else if((!all)&& a.el.dataset.forcedisable!='false'){
				a.el.dispatchEvent(this.disableEvent);
			}
		})
	}
	

	toggleCheckButtons(el,bool){
		if(bool === true){
			el.dispatchEvent(this.enableEvent);
			el.dataset.forcedisable='false';

		}else if(bool === false){
			el.dispatchEvent(this.disableEvent);
			el.dataset.forcedisable='true';
		}else{
			el.dataset.forcedisable='';
		}
	}


	//显示提示内容
	validateNotice(el,notice,isTop){

		let domNotice;
		let parent;

		if(isTop){
			parent=this.option.el;
		}else if(this.option.inline){
			parent=el.parentElement.parentElement;
		}else{
	    	parent=el.parentElement;
		}

		domNotice=parent.querySelector('.'+this.option.className);


	    if(!domNotice){
	      domNotice=document.createElement('div');
	      domNotice.className=this.option.className;
	      if(isTop){
	      	parent.insertBefore(domNotice,parent.childNodes[0]);
	      }else{
	      	parent.appendChild(domNotice);
	      }
	    }

	    if(this.option.inline){
			domNotice.style.display='inline-block';
			domNotice.style.padding='0 10px';
		}

	    domNotice.innerHTML=`<p style="background:#ffd7d7;
		color:#f55;
		line-height:26px;
		font-size:12px;
		text-align:left;
		padding: 0 10px;
    	border-radius: 2px;
    	border: 1px solid #ffc8c8;">${notice}</p>`;

	}

	//移除提示
	removeValidateNotice(el,isTop){
		let parent;
		if(isTop){
			parent=this.option.el;
		}else if(this.option.inline){
			parent=el.parentElement.parentElement;
		}else{
			parent=el.parentElement;
		}
		let domNotice=parent.querySelector('.'+this.option.className);
		if(domNotice){
			parent.removeChild(domNotice);
		}
	}
}










