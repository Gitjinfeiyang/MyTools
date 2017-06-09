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
// 					'400':'username error'
// 				}
// 			}
// 		}
// 	},
//
// 	inline:false,                //是否同一行显示  默认在下方
// 	hot:true,                    //热检测，即无需点击提交按钮，输入时检测   默认true
// 	submitButton:'提交按钮',
//	className:'validate-notice', //提示的dom元素class
// }


const DEFAULTOPTION={
	inline:false,
	hot:true,
	className:'validate-notice',
};

const MODELTYPE={


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
        obj.open('GET',url+query,true);
        obj.onreadystatechange=function(){
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState==4说明请求已完成
                fn.call(this, obj.responseText);  //从服务器获得数据
            }
        };
        obj.send(null);
    },
    post: function (url, data, fn) {
        var obj = new XMLHttpRequest();
        obj.open("POST", url, true);
        obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // 发送信息至服务器时内容编码类型
        obj.onreadystatechange = function () {
            if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
                fn.call(this, obj.responseText);
            }
        };
        obj.send(data);
    }
}


class Validation {

	constructor(option){
		this.legal=true;
		this.option=Object.assign({},DEFAULTOPTION,option);
		this.inputs=this.option.el.querySelectorAll('[name]');
		this.init();
	}

	init(){

		// 如果是热检测
		if(this.option.hot){

			for(let input of this.inputs){
				input.addEventListener('keyup',(e) => {
					debounce(() => {
						this.validateData(input,this.option.model[input.name]);						
					});
				});
			}

		}

		this.option.submitButton&&this.option.submitButton.addEventListener('click', (e) => {

			this.validateForm();

		});



	}

	//验证数据是否合法
	validateData(el,model){
		let validate=true,
			a=el,
			m=model,
			errType='';

	      //是否需要验证
	      if(!m){
	      	return;
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

	      if(m.confirm){
	      	if(m.confirm.value != a.value){
	      		validate=false;
	      		errType='confirm';
	      	}
	      }

	      //本地验证完毕后
	      if(validate){
	      	if(m.ajax){
	      		this.serverValidate(a,m);
	      	}else{
	      		this.removeValidateNotice(a);
	      	}

	      }else{
	      	if(typeof m.notice == 'object'){
	      		this.validateNotice(a,m.notice[errType]);
	      	}else{
	      		this.validateNotice(a,m.notice);
	      	}
	      }

	      return validate;
	}

	serverValidate(el,model){
		Ajax[model.ajax.method](model.ajax.url,{[el.name]:el.value},(res) => {

			let notice=model.ajax.code[JSON.parse(res)[model.ajax.name]];
			if(notice){
				this.validateNotice(el,notice);
			}else{
				this.removeValidateNotice(el);
			}

		});
	}


	//根据数据模型对整个表单进行验证
	validateForm(){
		let {model}=this.option;

	    //取得所有元素
	    let inputs=this.inputs;
	    let allValidate=true;


	    //inputs为nodelist，在ie下用foreach会报错
	    for(let i=0; i<inputs.length; i++){

	      let a=inputs[i];
	      let m=model[a.name];


	      // 验证完毕
	      if(!this.validateData(a,m)){
	        if(allValidate){
	          allValidate=false;
	        }
	      }

	    }

	    return allValidate;
	}


	//显示提示内容
	validateNotice(el,notice){

		let domNotice;
		let parent;

		if(this.option.inline){
			parent=el.parentElement.parentElement;
		}else{
	    	parent=el.parentElement;
		}

		domNotice=parent.querySelector('.'+this.option.className);


	    if(!domNotice){
	      domNotice=document.createElement('div');
	      domNotice.className=this.option.className;
	      parent.appendChild(domNotice);
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
	removeValidateNotice(el){
		let parent;
		if(this.option.inline){
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









