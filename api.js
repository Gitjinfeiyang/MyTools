/**
 * Created by Jinfeiyang on 2017-12-11.
 */
import axios from 'axios';
import store from '../vuex/store'
import ERROR_CODE from './ErrorCode.js';

export const env=process.env.NODE_ENV;


const TEST_HOST='10.12.102.122';
const PRODUCTION_HOST='10.12.102.134';

const HOST=process.env.API_ROOT; //接口ip同时也是前端ip


let url='http://'+HOST+':8092/login'

let LOGIN_URL=(function(){
  if(env == 'development'){
    url='http://'+process.env.HOST+':8080/login';
    // url='http://10.10.71.241:8080/login'
  }
  return 'http://61.164.53.62:8041/cas/login?service=http%3A%2F%2F'+HOST+'%3A9090%2Fproxy-server%2Fredirect?url='+encodeURIComponent(encodeURIComponent(url));
})()
//自动切换api
let apiRoot=process.env.API_ROOT;



const URL='http://'+HOST+':7080/dcm-web/';
let api=axios.create({
  baseURL:URL
});



//在这里定义每个人的地址


// let bianzhen='http://10.12.102.134:7080/dcm-web/';//卞振
// let yehuan='http://10.10.71.191:7080/dcm-web/';//叶欢
// let tuyu='http://10.10.68.137:7080/dcm-web/';//涂宇
// let zhaoqiao='http://10.10.70.58:7080/dcm-web/';//赵桥
// let liuxiangyong='http://10.12.102.134:7080/dcm-web/';//


let bianzhen='';//卞振
let yehuan='';//叶欢
let huangli='';//黄历
let tuyu='';//涂宇
let zhaoqiao='';//赵桥
let liuxiangyong='';//赵桥




api.interceptors.request.use(function (config) {
      // Do something before request is sent

      config.headers.Authorization=store.state.token;
      config.headers.ticket=store.state.ticket;
      // config.headers.roleId='8';
      // config.headers.roleName='指挥长';
      return config;
    }, function (error) {
      // Do something with request error
      return Promise.reject(error);
  });

// Add a response interceptor
api.interceptors.response.use(function (response) {
  // Do something with response data
  //没有token时服务器返回203
  let code=response.data.code
  if(response.status == 203){
    window.location.href='http://61.164.53.62:8041/cas/logout?service=http://61.164.53.62:8041/snow6'
  }
  if(response.data&&code != 0 && code != ERROR_CODE.NO_RECODE){
    store.dispatch('showNotice',response.data.msg);
  }
  return response;
}, function (error) {
  // Do something with response error
  store.dispatch('showNotice','Response Error : 来自服务器的错误')
  return Promise.reject(error);
});

//时间转换
class TimeChange {
  tempToYMD(temp){ //时间戳转换成YY-MM-DD
    return new Date(temp).toISOString().slice(0, 10)
  }
  tempToYMD2(temp){ //时间戳转换成YY-MM-DD hh:mm:ss
    var d = new Date(temp);
    var dformat = [ d.getFullYear(), (d.getMonth() + 1).toString().padStart(2,'00'), d.getDate().toString().padStart(2,'00') ].join('-')
            + ' ' + [ d.getHours().toString().padStart(2,'00'), d.getMinutes().toString().padStart(2,'00'), d.getSeconds().toString().padStart(2,'00') ].join(':');
    return dformat;
  }
  YMDToTemp(time){ // 转换成时间戳
    return Date.parse(new Date(time))
  }
  TempToTime(temp){//时间戳转换成时间
    let min = temp/60/1000
    if(min>1){
      return Math.floor(min)+'分钟'
    }else if(0<min&&min<=1){
      return '不足1分钟'
    }else{
      return '0'
    }
  }
  Time8061(time){
    let a = time.split(' ').join('T')+'+08:00'
    return a
  }
  IOS8061ToTime(time){
    return time.substr(0,19).split('T').join(' ')
  }
}
let Times = new TimeChange()





//权限管理api
class Permission {
  getOrganizationTree(){
    return api.get('org/find.json')
  }

  getOrganizationList(){
    return api.get(`org/findOrgList.json`)
  }

  getOrganizationDetail(id){
    return api.get(`org/findOne.json?id=${id}`)
  }

  updateOrganizationDetail(org){
    return api.post('org/update.json',org)
  }

  addOrganization(org){
    return api.post('org/add.json',org)
  }

  sortOrg(ids){
    return api.post('org/sortOrg.json',{orgIds:ids});
  }

  deleteOrg(ids){
    return api.post(`org/del.json`,{orgIds:ids})
  }



  getStaffsTree(){
    return api.get(`cas/orgTree.json`)
  }

  getStaffs(orgIds,start,rows,staffName){
    return api.get(`staff/find.json?orgIds=${orgIds}&start=${start}&rows=${rows}&staffName=${staffName}`)
  }

  addStaff(staff){
    return api.post(`staff/add.json`,staff)
  }

  updateStaff(staff){
    return api.post(`staff/update.json`,staff)
  }

  deleteStaff(id){
    return api.post(`staff/del.json`,{id:id})
  }

  getMenuTree(){
    return api.get(`menu/find.json`)
  }

  addMenu(menu){
    return api.post(`menu/add.json`,menu)
  }

  editMenu(menu){
    return api.post('menu/update.json',menu)
  }

  deleteMenu(menuIds){
    return api.post(`menu/del.json`,{menuIds})
  }

  sortMenu(menuIds){
    return api.post(`menu/sortMenu.json`,{menuIds})
  }

  getRoles(){
    return api.get(`role/find.json`)
  }

  getRoleMenu(roleId){
    return api.get(`role/getRoleMenus.json?roleId=${roleId}`)
  }

  addRoleMenu(roleId,menuId,sysId){
    return api.post(`role/addRoleMenu.json`,{roleId,menuId,sysId});
  }

  sortRole(id,targetId){
    return api.post(`role/sort.json`,{id,targetId})
  }

  updateRole(role){
    return api.post('role/update.json',role)
  }

  addRole(role){
    return api.post('role/add.json',role)
  }

  deleteRole(id){
    return api.post('role/del.json',{id})
  }

  frozenStaff(id){
    return api.post(`staff/frozen.json`,{id})
  }

  unFrozenStaff(id){
    return api.post(`staff/unFrozen.json`,{id})
  }

  login(account,psd){
    return api.get(`staff/login.json?account=${account}&psd=${psd}`)
  }

//todo
  getUserData(ticket){
    return api.get(`staff/casLogin.json?ticket=${ticket}`)
  }

  updatePassword(account,oldpsd,psd){
    return api.post('staff/updatePsd.json',{account,oldpsd,psd})
  }

  getSubSystem(){
    return api.get(`subSystem/find.json`)
  }

  addSubSystem(subName,url,icon){
    return api.post(`subSystem/add.json`,{subName,url,icon})
  }

  updateSubSystem(id,subName,url,icon){
    return api.post(`subSystem/update.json`,{id,subName,url,icon})
  }

  deleteSubSystem(id){
    return api.post(`subSystem/del.json`,{id})
  }

  sortSubSystem(id,targetId){
    return api.post(`subSystem/sort.json`,{id,targetId})
  }

  refreshOnline(id,staffName){
    return api.post('staff/refreshOnline.json',{id,staffName})
  }

  loginOut(id){
    return api.get('http://61.164.53.62:8041/cas/logout?service=http://61.164.53.62:8041/snow6')
  }

  changeRole(role,token){
    return api.get(`staff/changeRole.json?role=${role}&token=${token}`)
  }











  //gis api start

  createCommunity(data){
    return api.post(`${bianzhen}gis/community/create.json`,data)
  }

  createGrid(data){
    return api.post(`${bianzhen}gis/grid/create.json`,data)
  }

  createStreet(data){
    return api.post(`${bianzhen}gis/street/create.json`,data)
  }

  createPart(data){
    return api.post(`${bianzhen}gis/districtpartition/create.json`,data)
  }

  createPartType(data){
    return api.post(`${bianzhen}gis/districtpartitiontype/create.json`,data)
  }

  updateCommunity(data){
    return api.post(`${bianzhen}gis/community/update.json`,data)
  }

  updateGrid(data){
    return api.post(`${bianzhen}gis/grid/update.json`,data)
  }

  updateStreet(data){
    return api.post(`${bianzhen}gis/street/update.json`,data)
  }

  updatePart(data){
    return api.post(`${bianzhen}gis/districtpartition/update.json`,data)
  }

  deleteCommunity(id){
    return api.post(`${bianzhen}gis/community/delete.json`,{id})
  }
  deleteGrid(id){
    return api.post(`${bianzhen}gis/grid/delete.json`,{id})
  }
  deleteStreet(id){
    return api.post(`${bianzhen}gis/street/delete.json`,{id})
  }
  deletePart(id){
    return api.post(`${bianzhen}gis/districtpartition/delete.json`,{id})
  }

  getCommunityList(){
    return api.get(`${bianzhen}gis/community/list.json?start=0&rows=99`)
  }

  getGridList(){
    return api.get(`${bianzhen}gis/grid/list.json?start=0&rows=99`)
  }

  getStreetList(){
    return api.get(`${bianzhen}gis/street/list.json?start=0&rows=99`)
  }

  getPartList(){
    return api.get(`${bianzhen}gis/districtpartition/list.json?start=0&rows=99`)
  }

  getPartTypeList(){
    return api.get(`${bianzhen}gis/districtpartitiontype/list.json?start=0&rows=99`)
  }

  getPolygonTree(){
    return api.get(`${bianzhen}gis/utile/treeDistrictRegion.json`)
  }

  getPolygonContainsPoint(geo){
    return api.get(`${bianzhen}gis/utile/findShapeByPoint.json?lon=${geo[0]}&lat=${geo[1]}`)
  }





  getComponentTree(id=0){
    return api.get(`${bianzhen}dict/casetype/tree.json?id=${id}`)
  }

  getTableListByCateId(id){
    return api.get(`${huangli}gisUnit/findListBySmallCategory.json?smallCategory=${id}`)
  }

  getTableById(id){
    return api.get(`${huangli}gisUnit/info.json?id=${id}`)
  }

  createTable(table){
    return api.post(`${huangli}gisUnit/create.json`,table);
  }

  updateTable(table){
    return api.post(`${huangli}gisUnit/update.json`,table)
  }

  deleteTable(id){
    return api.post(`${huangli}gisUnit/delete.json`,{id})
  }

  getTableDetailByName(name){
    return api.get(`${huangli}gisUnit/tableInfo.json?tableName=${name}`)
  }

  addTableKeyword(data){
    return api.post(`${huangli}gisUnit/addField.json`,data);
  }

  updateTableKeyword(data){
    return api.post(`${huangli}gisUnit/updateField.json`,data);
  }

  deleteKeyword(data){
    return api.post(`${huangli}gisUnit/deleteField.json`,data);
  }

  getTableDataList(tableName,start,rows){
    return api.get(`${huangli}gisUnit/findGisUnitInfoPage.json?&tableName=${tableName}&start=${start}&rows=${rows}`)
  }



  getComponentsByCategory(idArray){
    return api.get(`${huangli}gisUnit/findGisUnitInfoListBySmallCategory.json?smallCategoryList=${JSON.stringify(idArray)}`)
  }









  getConfig(name='map'){
    return api.get(`${huangli}gisConfig/findOne.json?name=${name}`)
  }

  //gis api end





  //










  getCalendarList(year){
    return api.get(`${yehuan}dict/getCalCalendarList?year=${year}`)
  }

  updateCalendarList(year,list){
    return api.post(`${yehuan}dict/updateCalCalendar`,{year,})
  }



  //排班管理
  getSystemWorkClassList(){
    return api.get(`${yehuan}dict/getCalWorkClassList?type=1`)
  }

  addSystemWorkClass(workClass){
    workClass.type=1;
    return api.post(`${yehuan}dict/addCalWorkClass`,workClass)
  }

  updateSystemWorkClass(workClass){
    workClass.type=1;
    return api.post(`${yehuan}dict/updateCalWorkClass`,workClass)
  }

  deleteSystemWorkClass(id){
    return api.post(`${yehuan}dict/deleteCalWorkClass`,{id})
  }

  getSystemArrangeWorkClassList(startDate,endDate,userName){
    if(userName.length>0){
      return api.get(`${yehuan}plan/getCalScheduleListByName?startDate=${startDate}&endDate=${endDate}&userName=${userName}`)
    }else{
      return api.get(`${yehuan}plan/getCalScheduleList?startDate=${startDate}&endDate=${endDate}`)
    }
  }

  addSystemArrangeWorkClass(workClass){
    return api.post(`${yehuan}plan/addCalSchedule`,workClass)
  }

  updateSystemArrangeWorkClass(workClass){
    return api.post(`${yehuan}plan/updateCalSchedule`,workClass)
  }

  deleteSystemArrangeWorkClass(date,classId,updateUserId){
    return api.post(`${yehuan}plan/deleteCalSchedule`,{date,classId,updateUserId})
  }

  getWorkRoleList(){
    return api.get(`${yehuan}role/findScheduleRole.json`)
  }



  //采集员管理
  getCollectorWorkClassList(){
    return api.get(`${yehuan}dict/getCalWorkClassList?type=2`)
  }

  addCollectorWorkClass(workClass){
    workClass.type=2;
    return api.post(`${yehuan}dict/addCalWorkClass`,workClass)
  }

  updateCollectorWorkClass(workClass){
    workClass.type=2;
    return api.post(`${yehuan}dict/updateCalWorkClass`,workClass)
  }

  getCollectorArrangeWorkClassList(date,username,start,rows){
    return api.get(`${yehuan}plan/getCollectorWorkPage?month=${date}&userName=${username}&start=${start}&rows=${rows}`)
  }

  addCollectorArrangeWorkClass(workClass){
    return api.post(`${yehuan}plan/saveCollectorWorkList`,workClass)
  }

  getCollectorWorkClassCheckList(startDate,endDate){
    return api.get(`${yehuan}plan/getCollectorWorkGridStat?startDate=${startDate}&endDate=${endDate}`)
  }































  //分页查询案件
  getPageCaseList({start,rows} = {start: 0, rows: 10}){
    return api.get(`${tuyu}caseCurrent/pageCase.json?start=${start}&rows=${rows}&activitiProcessInstanceId=`)
  }
  //查询单个案件
  getCaseInfo(id, taskCode){
    return api.get(`${tuyu}caseCurrent/getCase.json?id=${id}&taskCode=${taskCode}`)
  }

  //删除案件
  delCase(id, taskCode){
    return api.get(`${tuyu}caseCurrent/deleteCase.json?id=${id}&taskCode=${taskCode}`)
  }
  //设为典型案卷
  setTypicalCase(id, taskCode){
    return api.get(`${tuyu}caseCurrent/setTypicalCase.json?id=${id}&taskCode=${taskCode}`)
  }
  //取消典型案卷
  cancelTypicalCase(id, taskCode){
    return api.get(`${tuyu}caseCurrent/cancelTypicalCase.json?id=${id}&taskCode=${taskCode}`)
  }
  //登记案件
  addCase(data){
    return api.post(`${tuyu}caseCurrent/addCase.json`, data)
  }

  //获取案卷类别树
  getCaseTypeList(id){
    return api.get(`${bianzhen}dict/casetype/tree.json?id=${id}`)
  }

  //获取案卷类别树
  getCaseSourceList({start,rows} = {start: 0, rows: 99}){
    return api.get(`${bianzhen}dict/casesource/list.json?start=${start}&rows=${rows}`)
  }

  //获取道路
  getRoadList({start,rows} = {start: 0, rows: 99}){
    return api.get(`${bianzhen}gis/road/list.json?start=${start}&rows=${rows}`)
  }

  //获取道路
  getRoadSectionList(roadId = 0){
    return api.get(`${bianzhen}gis/roadSection/list.json?roadId=${roadId}`)
  }
  // //获取街道
  // getStreetList(roadId = 0){
  //   return api.get(`${bianzhen}gis/street/list.json?roadId=${roadId}`)
  // }
  //获取道路类型
  getRoadTypeList(){
    return api.get(`${bianzhen}gis/roadtype/list.json`)
  }
  //获取立案条件
  getCaseRuleList(caseTypeId = 0){
    console.log('req', caseTypeId)
    return api.get(`${zhaoqiao}dict/getCaseRuleList.json?caseTypeId=${caseTypeId}`)
  }

  //获取紧急相关信息
  getExigenceCaseInfo({areaTypeId, caseTypeId, roadTypeCode} = {areaTypeId: 2, caseTypeId:4, roadTypeCode: 2}){
    return api.get(`${zhaoqiao}dict/getCaseRuleMap.json?areaTypeId=${areaTypeId}&caseTypeId=${caseTypeId}&roadTypeCode=${roadTypeCode}`)
  }

  //案件登记流转
  startFlow(data){
    return api.post(`${liuxiangyong}workFlow/startFlow.json`, data)
  }

  //案件登记流转
  completeFlow(data){
    return api.post(`${liuxiangyong}workFlow/complete.json`, data)
  }

  //案件登记流转
  backTask(data){
    return api.post(`${liuxiangyong}workFlow/backTask.json`, data)
  }

  //经办案卷
  getHisMyTasList({start,rows,taskCode} = {start: 0, rows: 99, taskCode: 0}){
    return api.get(`${liuxiangyong}workFlow/pageHisMyTask.json?start=${start}&rows=${rows}&taskCode=${taskCode}`)
  }
  //发起案卷
  getHisMyTasList({start,rows,taskCode} = {start: 0, rows: 99, taskCode: 0}){
    return api.get(`${liuxiangyong}workFlow/pageHisMyTask.json?start=${start}&rows=${rows}&taskCode=${taskCode}`)
  }
  //获取快速结案类型
  getCaseQuickClosingTypeList(){
    return api.get(`${liuxiangyong}dict/getCaseQuickClosingTypeList.json`)
  }
  //获取作废类型
  getCaseCancelTypeList(){
    return api.get(`${liuxiangyong}dict/getCaseCancelTypeList.json`)
  }

}


let API = new Permission();


function type(obj) {
  var toString = Object.prototype.toString;
  var map = {
    '[object Boolean]'  : 'boolean',
    '[object Number]'   : 'number',
    '[object String]'   : 'string',
    '[object Function]' : 'function',
    '[object Array]'    : 'array',
    '[object Date]'     : 'date',
    '[object RegExp]'   : 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]'     : 'null',
    '[object Object]'   : 'object'
  };
  if(obj instanceof Element) {
    return 'element';
  }
  return map[toString.call(obj)];
}

//深复制
function deepClone(data) {
  var t = type(data), o, i, ni;

  if(t === 'array') {
    o = [];
  }else if( t === 'object') {
    o = {};
  }else {
    return data;
  }

  if(t === 'array') {
    for (i = 0, ni = data.length; i < ni; i++) {
      o.push(deepClone(data[i]));
    }
    return o;
  }else if( t === 'object') {
    for( i in data) {
      o[i] = deepClone(data[i]);
    }
    return o;
  }
}


function traverseMenu(data,callback=function(data,hasChildren,options){},options={depth:0}){
          let ids='';
          if(data instanceof Array){
            for(let i=0; i<data.length; i++){
              ids+=traverseMenu(data[i],callback);
            }
          }else if(data.children&&data.children.length>0){
            callback(data,true,{depth:options.depth++});
            ids+=data.id+',';
            for(let i=0; i<data.children.length; i++){
              ids+=traverseMenu(data.children[i],callback);
            }
          }else{
            callback(data,false,{depth:options.depth++});
            ids+=data.id+',';
          }
          return ids;
        }


//默认分页rows
const rows=10;

//菜单 功能
const menuType={
  MENU:'menu',
  FUNCTION:'fun',
  'menu':'菜单',
  'fun':'功能',
}

const roadType={
  1:'主要道路',2:'次要道路',3:'背街小巷',4:'其他',
  list:[
    {key:1,name:'主要道路'},
    {key:2,name:'次要道路'},
    {key:3,name:'背街小巷'},
    {key:4,name:'其他'},
  ]
}



//正则表达式
class Patterns {
  getRequired(name,trigger='blur',type='string'){
    return {required:true,type,message:name+'不能为空',trigger}
  }
  getLength(min,max){
    return {min,max,message:"长度必须为"+min+'-'+max+'字符',trigger:'blur'}
  }
  getLater(prefix,trigger="change"){
    const validator=(rule,value,callback) => {
      if(new Date(value).getTime&&new Date(value).getTime()<=Date.now()){
        callback(new Error(prefix+"必须大于当前时间"))
      }else{
        callback();
      }
    }
    return {validator,type:'date',trigger}
  }
}

//权限控制
// let permissions=getPermissions(permissionStr);
// permissions.check('del')
function getPermissions(arrayOrObj){
  let permissions='';
  if(arrayOrObj instanceof Array){
    for(let i =0; i<arrayOrObj.length; i++){
      if(arrayOrObj[i].classify == 'fun'){
        permission+=arrayOrObj[i].funCode+',';
      }
    }
  }else{
    let menu;
    traverseMenu(arrayOrObj.menu,function(data,hasChildren){
      if(data.classify == 'fun'){
        permissions+=data.funCode+',';
      }
    })
  }

  return {
    check:function(name){
      let allow=false;
      if(permissions.indexOf(name)>=0){
        allow=true;
      }
      return allow;
    }
  }

}

function toggleFullScreen(ele) {
  if (!document.mozFullScreen && !document.webkitIsFullScreen) {
    if (ele.mozRequestFullScreen) {
      ele.mozRequestFullScreen();
    } else {
      ele.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else {
      document.webkitExitFullscreen();
    }
  }
}


function formatDate(date){
  if(!date) return ['',''];
  let dateObj=date;
  if(dateObj.getTime){

  }else{
    try{
      dateObj=new Date(date);
    }catch(err){
      return [date,''];
    }
  }

  let day=dateObj.getDate();
  let month=dateObj.getMonth()+1;
  let year=dateObj.getFullYear();
  let hour=dateObj.getHours();
  let minute=dateObj.getMinutes();
  let second=dateObj.getSeconds();
  if(day<10) day='0'+day;
  if(month<10) month='0'+month;
  if(hour<10) hour='0'+hour;
  if(minute<10) minute='0'+minute;
  if(second<10) second='0'+second;

  return[year+'-'+month+'-'+day,hour+':'+minute+':'+second];

}

const WEEK=['一','二','三','四','五','六','日',]


  let traverseParent=function(data,callback){
    callback(data)
    if(data._parent){
      traverseParent(data._parent,callback)
    }
  }

//树搜索方法
//@params(tree) Array 要搜索的树
//@params(keyword) String 搜索关键字
//@params(returnNewTree) String 是否返回新的树
//@return(newTree) Array 返回过滤后的树
function treeFilter(tree,keyword,returnNewTree=true,callback=function(data,hasChildren,options){}){

  if(returnNewTree){
    if(!keyword||typeof keyword !='string' || keyword.length<=0) return tree;
    traverseMenu(tree,function(data,hasChildren){
      if(data._parent){
        data._parent=null;
      }
    })
  }

  let _tree=returnNewTree?deepClone(tree):tree;
  let treeList=[];
  let newTree=[];
  traverseMenu(_tree,function(data,hasChildren,{depth}){

    callback(data,hasChildren,{depth})
    //如果是最后一层并且没有被判断过
    if(!data._show){
      data._hasKeyword=false;
      data._show=false;
      if(data.title.indexOf(keyword) >=0){
        data._hasKeyword=true;
        data._show=true;
      }
    }

    if(hasChildren){
        for(let i=0; i<data.children.length; i++){
          data.children[i]._parent=data;
        }

      //有children 让children都显示
      if(data._show){
        for(let i=0; i<data.children.length; i++){
          data.children[i]._show=true;
        }
      }

    }

    //此时当前节点的parent都已判断完毕
    if(data._show){
      traverseParent(data,(d_p) => {
        d_p.expand=true;
        if(d_p._parent){
          d_p._parent._show=true;
        }
      })
    }

  })
      //构建新的树
    for(let i=0; i<_tree.length; i++){
      if(_tree[i]._show){
        newTree.push(_tree[i]);
      }
      delete _tree[i]._show;
    }

    traverseMenu(newTree,function(data,hasChildren){
      if(hasChildren){
        data._children=[];
        for(let i=0; i<data.children.length; i++){
          if(data.children[i]._show){
            data._children.push(data.children[i]);
          }
          delete data.children[i]._show;
        }
        data.children=data._children;
      }
    })



  return newTree;

}



//计算size
function calcSize(selector,options={offset:0},key="offsetHeight"){
  let dom=document.querySelector(selector);
  let targetSize=dom[key];
  if(targetSize){
    return targetSize+options.offset;
  }
  return 0;
}

function unique (arr) {
  return Array.from(new Set(arr))
}


let patterns=new Patterns();


const ORG_TYPE=[
  {id:"1",name:'处置部门'},
  {id:"2",name:'采集公司'},
  {id:"3",name:'待整治公司'},
  {id:"4",name:'处置二级部门'},
]




export {API,rows,deepClone,menuType,patterns,toggleFullScreen,
  traverseMenu,getPermissions,api,formatDate,treeFilter,roadType,calcSize,WEEK,Times,unique,LOGIN_URL,ORG_TYPE,URL,HOST};
