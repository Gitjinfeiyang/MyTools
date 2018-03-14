/**
 * Created by Jinfeiyang on 2017-1-24.
 *  fucking this shit :).
 */

import {deepClone} from '../assets/api';


//图层相关
  function getLocalSource(url,isBaseLayer=false){
    return new OpenLayers.Layer.WMTS({
            name: isBaseLayer?"本地底图":"本地标注",
            url: url+"/L{TileMatrix}/R{TileRow}/C{TileCol}.png",
            layer:'baselayer',
            matrixSet: "EPSG:4326",
            requestEncoding:"REST",
            format: "image/png",
            style: "_null",
            isBaseLayer: isBaseLayer,
            renderers: ["Canvas"],
        })
  };

  function getOnlineSource(url,isBaseLayer=false){
    return new OpenLayers.Layer.XYZ(
              isBaseLayer?"在线底图":"在线标注",
              [
                  url+"&X=${x}&Y=${y}&L=${z}",
              ],
              {
                  isBaseLayer: isBaseLayer,
                  displayInLayerSwitcher:true,
                  renderers: ["Canvas"],
              }
      );
  }
//图层相关















 export default class OlHelper{

  static DRAW_TYPE={
        MultiPolygon:'MultiPolygon',
              Polygon:'Polygon',
              LineString:'LineString',
              Point:'Point',
              Box:'Box',
              Circle:'Circle',
              Modify:'Modify',
            }

    static MODIFY_MODE={
      reshape:OpenLayers.Control.ModifyFeature.RESHAPE,
      rotate:OpenLayers.Control.ModifyFeature.ROTATE,
      resize:OpenLayers.Control.ModifyFeature.RESIZE,
      drag:OpenLayers.Control.ModifyFeature.DRAG,
    }

  static config={
    target:"map",
    projection:"EPSG:4326",
    renderers: ["Canvas"],
    onlineUrl1:'http://t0.tianditu.com/DataServer?T=vec_c',
    onlineUrl2:'http://t0.tianditu.com/DataServer?T=cva_c',
    localUrl1:'http://10.12.102.136/tiles/map',
    localUrl2:'http://10.12.102.136/tiles/point',
    center:[116.82372582753,30.746244271596],
    zoom:13,
    minZoom:13,
    maxZoom:17,
    online:1, //是否使用在线源
  }

  static getFeatureType=function(coordinates){
        if(coordinates[0]&&coordinates[0][0]&&coordinates[0][0][0]){
                return OlHelper.DRAW_TYPE.Polygon;
              }else if(coordinates[0]&&coordinates[0][0]){
                return OlHelper.DRAW_TYPE.LineString;
              }else{
                return OlHelper.DRAW_TYPE.Point;
              }
  }


  // 分割
   // 一次分割多个复杂 ，暂支持分割两个
  static splitPolygon(polygon,lineString){
    let tx1=NaN,ty1=NaN,tx2=NaN,ty2=NaN;
    let split=0;
    let line=[];
    let commonPoints=[
      // {
      //   lineIndex:0,
      //   point:{
      //     coordinates:[],
      //     polygonIndex:0
      //   }
      // }
    ];

    //每条线段的交点
    let point=[];
    let start=[],end=[];
    for(let i=0; i<lineString.length; i++){
      split=i;
      start=lineString[split];
      split++;
      if(split>=lineString.length){
        break;
      }
      end=lineString[split];
      line=[start,end];
      point=OlHelper.getPointsCommon(polygon,line);
      if(point.length>0){
        for(let j=0; j<point.length; j++){
          commonPoints.push({lineIndex:i,point:point[j]})
        }
      }
    }

    let startPoint=commonPoints[0];
    let endPoint=commonPoints[1];
    let direction=false;
    let fragment1;
    let fragment2;
    let fragment3;
    let fragment4=getArrayByRange(lineString,startPoint.lineIndex+1,endPoint.lineIndex);
    fragment4.unshift(startPoint.point.coordinates);
    fragment4.push(endPoint.point.coordinates);
    let fragment4R=deepClone(fragment4).reverse();
    let polygon1,polygon2;

    if(startPoint.point.polygonIndex - endPoint.point.polygonIndex <0){
      console.log('right')
      fragment1=getArrayByRange(polygon[0],0,startPoint.point.polygonIndex);
      fragment2=getArrayByRange(polygon[0],startPoint.point.polygonIndex+1,endPoint.point.polygonIndex);
      fragment3=getArrayByRange(polygon[0],endPoint.point.polygonIndex+1,polygon[0].length);
      polygon1=[Array.concat(fragment1,fragment4,fragment3)];
      polygon2=[Array.concat(fragment2,fragment4R,[fragment2[0]])];
    }else{
      fragment1=getArrayByRange(polygon[0],0,endPoint.point.polygonIndex);
      fragment2=getArrayByRange(polygon[0],endPoint.point.polygonIndex+1,startPoint.point.polygonIndex);
      fragment3=getArrayByRange(polygon[0],startPoint.point.polygonIndex+1,polygon[0].length);
      polygon1=[Array.concat(fragment1,fragment4R,fragment3)];
      polygon2=[Array.concat(fragment2,fragment4,[fragment2[0]])];
    }

    return {polygons:[polygon1,polygon2],points:commonPoints};
  }



   //判断线段交点
   //多边形返回多个
   //线段返回一个
   //@polygon 线段数组
   //@lineString 一定要是线段
   static getPointsCommon(polygon,lineString){
    let lineStart=lineString[0];
    let lineEnd=lineString[lineString.length-1];
    let polygonPoints=polygon[0];

    let startX=lineStart[0];
    let startY=lineStart[1];
    let endX=lineEnd[0];
    let endY=lineEnd[1];

    let x1=NaN,y1=NaN,x2=NaN,y2=NaN; //交点坐标
    let index1=0,index2=0;
    let tx1,ty1,tx2,ty2;
    let x=NaN,y=NaN;

    let points=[
      // {index:0,point:[]}
      ]

    for(let i=0; i<polygonPoints.length-1; i++){
      let split=i;
      tx1=polygonPoints[split][0];
      ty1=polygonPoints[split][1];

      split+=1;

      tx2=polygonPoints[split][0];
      ty2=polygonPoints[split][1];
      if(isNaN(x)){
        if(tx1 == tx2){//斜率为无穷大时
          x=tx1;
        }else{
          x=(tx1*(ty2-ty1)/(tx2-tx1) - startX*(endY-startY)/(endX-startX) + startY - ty1)/((ty2-ty1)/(tx2-tx1) - (endY-startY)/(endX-startX));
        }
        if(!isNaN(x)){

          if(tx1 == tx2){
            y=(((x-startX)*(endY-startY))/(endX-startX))+startY;
          }else{
            y=(((x-tx1)*(ty2-ty1))/(tx2-tx1))+ty1;
          }
          //判断是否在线段内
          if((x>startX&&x>endX)||(x<startX&&x<endX)){
            x=NaN;
            y=NaN;
          }
          if((x>tx1&&x>tx2)||(x<tx1&&x<tx2)){
            x=NaN;
            y=NaN;
          }

        }
        if(!isNaN(x)&&!isNaN(y)){
          points.push({polygonIndex:i,coordinates:[x,y]})
        }

        x=NaN;
        y=NaN;
      }
    }

    return points;
  }

  static getFeatureSelected(layer){
              let featureSelected=layer.selectedFeatures;
                        let featuresData=[];

                        let feature;
                        if(!featureSelected||!featureSelected[0]) return [];
                        if(featureSelected[0].geometry.id.indexOf("Polygon")>=0){
                          for(let i=0; i<featureSelected.length; i++){
                            feature=featureSelected[i];
                              featuresData.push(getFeatureData((feature)))
                          }
                        }else{
                          for(let i=0; i<featureSelected.length; i++){
                            feature=featureSelected[i];
                            if(feature.cluster){
                              for(let o=0; o<feature.cluster.length; o++){
                                featuresData.push(getFeatureData((feature.cluster[o])));
                              }
                            }else{
                              featuresData.push(getFeatureData(feature));
                            }
                          }
                        }
                        return featuresData;
  }

  static getFeatureData=getFeatureData;


  static setDrawCache(layer){
    let cache=OlHelper.readDrawCache();
    if(cache.length>5) cache.shift();
    let features=layer.features;
    let data=[];
    let cacheItem={};
    for(let i=0; i<features.length; i++){
      data.push(getCoodinates(features[i]))
    }
    let date=new Date();
    cache.push({date:`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,features:data})
    localStorage.setItem('draw_cache',JSON.stringify(cache));
  }

  static readDrawCache(){
    let cache=localStorage.getItem('draw_cache')||"[]";
    return JSON.parse(cache)
  }

  static clearDrawCache(){
    localStorage.removeItem('draw_cache')
  }



  constructor(config={}){
    this.config=extend(OlHelper.config,config);
    this.mapConfig={
      div:this.config.target,
      restrictedExtent:this.config.maxExtent||null,
      numZoomLevels:20,
      // minExtent:this.config.minExtent,
      // maxExtent:this.config.maxExtent,
      // projection: this.config.projection,
      // displayProjection:'EPSG:900913',
    };

    this.currentZIndex=10;

    this.map = {};
    this.featureLayer={};
    this.selectControl={};
    this.hoverControl={};
    this.zoomListener=function(){}

    this.drawControls={};

    this.init();
  }


  //初始化地图
  init(){
    this.map = new OpenLayers.Map(this.mapConfig);
    // OpenLayers.Projection.addTransform("EPSG:4326","EPGS:900913");
    if(this.config.online){
      this.switchToOnlineSource()
    }else{
      this.switchToLocalSource()
    }
    this.setZoom(this.config.zoom)
    // this.map.zoomToMaxExtent();
    this.setCenter(this.config.center);
    // this.map.addControl(new OpenLayers.Control.LayerSwitcher());
    this.addFeatureLayer();

    this.map.isValidZoomLevel = (zoomLevel) => {
      return ((zoomLevel != null) && (zoomLevel >= this.config.minZoom) && (zoomLevel <= this.config.maxZoom));
    }

    this.map.events.register('zoomend',{},(event) => {
      this.zoomListener(this.map.getZoom())
    })


  }


  setCenter(center,zoom=this.map.getZoom()){
    this.map.setCenter(center,zoom);
  }




  enableDraw(type='Polygon',callback=function(feature){},layer){
        let self=this

        if(!this.drawControls[OlHelper.DRAW_TYPE.Point]){
                  this.drawControls = {
                      [OlHelper.DRAW_TYPE.Point]: new OpenLayers.Control.DrawFeature(layer,
                          OpenLayers.Handler.Point),
                      [OlHelper.DRAW_TYPE.LineString]: new OpenLayers.Control.DrawFeature(layer,
                          OpenLayers.Handler.Path),
                      [OlHelper.DRAW_TYPE.Polygon]: new OpenLayers.Control.DrawFeature(layer,
                          OpenLayers.Handler.Polygon),
                      [OlHelper.DRAW_TYPE.Box]: new OpenLayers.Control.DrawFeature(layer,
                          OpenLayers.Handler.RegularPolygon, {
                              handlerOptions: {
                                  sides: 4,
                                  irregular: true
                              }
                          }
                      ),
                      [OlHelper.DRAW_TYPE.Circle]: new OpenLayers.Control.DrawFeature(layer,
                          OpenLayers.Handler.RegularPolygon, {
                              handlerOptions: {
                                  sides: 40,
                                  irregular: true
                              }
                          }
                      ),
                      [OlHelper.DRAW_TYPE.Modify]:new OpenLayers.Control.ModifyFeature(layer)
                  };

                  let snap = new OpenLayers.Control.Snapping({
                    layer: layer,
                    // targets: [point, line, poly],
                    tolerance:3,
                    greedy: false
                  });

                  snap.activate()

        }


        let eventName="featureadded";
        for(var key in this.drawControls) {
          this.map.addControl(this.drawControls[key]);
          if(key == OlHelper.DRAW_TYPE.Modify){
            eventName="featuremodified";

          }else{
            eventName="featureadded";
            this.drawControls[key].events.listeners[eventName]=[];
            this.drawControls[key].events.register(eventName,this.drawControls[key],function(event){
              callback(getCoodinates(event.feature),event.feature)
            })
          }
        }

        //fucking openlayers2! empty the added listener at first!
        layer.events.listeners.featuremodified=[]
        layer.events.register("featuremodified",this.drawControls[OlHelper.DRAW_TYPE.Modify],function(event){
              callback(getFeatureData(event.feature),event.feature)
            })



              toggleControl(type);

              function toggleControl(element) {
                // if(self.drawControls[element].handler){
                //  self.drawControls[element].handler.stopDown = false;
                //  self.drawControls[element].handler.stopUp = false;
                // }

                  for(key in self.drawControls) {
                      var control = self.drawControls[key];
                      if(element == key) {
                          control.activate();
                      } else {
                          control.deactivate();
                      }
                  }
              }

  }

  setModifyMode(mode=OlHelper.MODIFY_MODE.drag){
    // console.log(this.drawControls[OlHelper.DRAW_TYPE.Modify],mode)
    this.drawControls[OlHelper.DRAW_TYPE.Modify].mode=mode;
  }

  disableDraw(layer){
    this.enableDraw('',function(){},layer);
  }

  backDraw(type){
    var control = this.drawControls[type];
    control&&control.undo&&control.undo();
  }

  drawSingleMode(layer=this.featureLayer){
    layer.events.listeners.beforefeatureadded=[];
    layer.events.listeners.beforefeaturesadded=[];
    layer.events.register("beforefeatureadded",this.drawControls[OlHelper.DRAW_TYPE.Point],(event) => {
      this.removeAllFeatures(layer);
    })
  }

  disableDrawSingleMode(layer=this.featureLayer){
    layer.events.listeners.beforefeaturesadded=[];
    layer.events.listeners.beforefeatureadded=[];
  }






  addLayer(options={}){


        let defaultOptions={
          name:'图层',
          cluster:true,
          styles:{default:{},selected:{}},
          rules:[
            // {filter:'==',key:'',value:''}
          ]
        };
        defaultOptions=extend(defaultOptions,options);

        let defaultStyle={
          // externalGraphic: '../../static/redicon.png',
                graphicOpacity: 1,
                // scale:1,
                fillColor: "#fff",
                strokeColor: "#00e0cd",
                strokeWidth:2,
                strokeOpacity:0.5,
                fontColor:'#E00AD4',
                // rotation: -45,
                pointRadius: 5,
        };
        let selectedStyle={
          // externalGraphic: '../../static/redicon.png',
                graphicOpacity: 1,
                // scale:1.2,
                fillColor: "yellow",
                fontColor:'#E00AD4',
                strokeColor: "#de00ac",
                strokeOpacity:1,
                strokeWidth:3,
                // rotation: -45,
                pointRadius: 10
        };

        let tempStyle=extend(defaultStyle,{pointRadius:12,stokeWidth:2,fillColor:"#00e0cd"})
        defaultStyle=extend(defaultStyle,defaultOptions.styles.default);
        selectedStyle=extend(selectedStyle,defaultOptions.styles.selected);

        let strategies;

        if(defaultOptions.cluster){
          strategies=new OpenLayers.Strategy.Cluster();
          defaultStyle.strokeWidth=selectedStyle.strokeWidth="${width}";
          defaultStyle.pointRadius=selectedStyle.pointRadius="${radius}";
        }



        let vectorConfig={
            renderers: ["Canvas"],
            styleMap: new OpenLayers.StyleMap({
                "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults(defaultStyle,
                   OpenLayers.Feature.Vector.style["default"]),
                {
                      context: {
                          width: function(feature) {
                              return (feature.cluster) ? 3 : 2;
                          },
                          radius: function(feature) {
                              var pix = 2;
                              if(feature.cluster) {
                                  pix = Math.min(feature.attributes.count, 15) + 5;
                              }
                              return pix;
                          },
                          size:function(feature){
                            var size=1;
                            if(feature.cluster) {
                                  size=feature.attributes.count;
                              }
                              return size;
                          },
                          name:function(feature){
                            return feature.data&&feature.data.name||'';
                          },
                          url:function(feature){
                            return feature.data&&feature.data.url||feature.cluster[0].data.url;
                          }
                      },
                  }),
                "select": new OpenLayers.Style(selectedStyle,{
                      context: {
                          width: function(feature) {
                              return (feature.cluster) ? 2 : 1;
                          },
                          radius: function(feature) {
                              var pix = 2;
                              if(feature.cluster) {
                                  pix = Math.min(feature.attributes.count, 15) + 8;
                              }
                              return pix;
                          },
                          name:function(feature){
                            return feature.data&&feature.data.name||'';
                          },
                          url:function(feature){
                            return feature.data&&feature.data.url||feature.cluster[0].data.url;
                          }
                      },
                  }),
                "temp":new OpenLayers.Style(tempStyle,{
                context: {
                  width: function(feature) {
                    return (feature.cluster) ? 2 : 1;
                  },
                  radius: function(feature) {
                    var pix = 2;
                    if(feature.cluster) {
                      pix = Math.min(feature.attributes.count, 15) + 8;
                    }
                    return pix;
                  },
                  name:function(feature){
                    return feature.data&&feature.data.name||'';
                  },
                  url:function(feature){
                          return feature.data&&feature.data.url||feature.cluster[0].data.url;
                        }
                },
              })
            })
        }
        if(defaultOptions.cluster){
          vectorConfig.strategies=[strategies];
        }
        var vector = new OpenLayers.Layer.Vector(defaultOptions.name,vectorConfig );
        this.map.addLayer(vector);
        return vector;
  }

  addPolygonLayer(options={}){
    let defaultOptions={
      name:"区块层",
      cluster:false,
      styles:{
        default:{
          label:"${name}",
        },
        selected:{
          label:"${name}",
        }
      }
    }

    defaultOptions=extend(defaultOptions,options)

    return this.addLayer(defaultOptions);
  }

  removeLayer(layer){
    this.map.removeLayer(layer);
  }

  addFeatureLayer(){
    this.featureLayer=this.addPolygonLayer({name:'基础数据',styles:{default:{fillOpacity:0,strokeColor:'#f00'}}});
  }

  removeFeatureLayer(){
    this.removeLayer(this.featureLayer);
  }


  //read geojson or esrijson
  addFeatures(featureJson,layer=this.featureLayer){
    let features={};
    let json=featureJson;
    if(featureJson.displayFieldName&&featureJson.geometryType){
      json=esriToGeo(featureJson);
    }

    var geojson_format = new OpenLayers.Format.GeoJSON();
    features=geojson_format.read(json);
    if(features){
      layer.addFeatures(features);
    }
  }


  //read coordinates transform to geojson
  addFeature(geo,properties={},layer=this.featureLayer){
        let type=OlHelper.getFeatureType(geo);
        let coordinates=[];
        //转换为geojson判断是否是multipolygon
        if(type == OlHelper.DRAW_TYPE.Polygon){
          if(geo.length>1){
            type=OlHelper.DRAW_TYPE.MultiPolygon;
            for(let i=0; i<geo.length; i++){
              coordinates.push([geo[i]]);
            }
          }else{
            coordinates=geo;
          }
        }else{
          coordinates=geo;
        }
    let json={
      "type": "Feature",
       "properties": properties,
       "geometry": { "type": type, "coordinates": coordinates }
        };
        this.addFeatures(json,layer);
  }



  removeAllFeatures(layer=this.featureLayer){
    layer.removeAllFeatures&&layer.removeAllFeatures();
  }

  removeFeatures(layer,features){
    layer.removeFeatures&&layer.removeFeatures(features);
  }


  addSelector(callback=function(feature){}){

    let layers=this.map.layers;
    let layersArray=[];
    for(let i=2; i<layers.length; i++){
      if(!layers[i].isBaseLayer&&layers[i] != this.featureLayer){
        layersArray.push(layers[i]);
      }
    }

    // this.hoverControl = new OpenLayers.Control.SelectFeature((layersArray.length==1?(layersArray[0]):layersArray), {
   //              hover: true,
   //              highlightOnly: true,
   //              renderIntent: "temporary"
   //          });

    this.selectControl = new OpenLayers.Control.SelectFeature(
                (layersArray.length==1?(layersArray[0]):layersArray),
                {
                    clickout: true,
                    multipleKey: "shiftKey", // shift key adds to selection
                    onSelect: function(feature){
                      let data=OlHelper.getFeatureSelected(feature.layer);
                      if(data.length<=0) return;
                      callback(data,feature);
                    },
                }
            );



            this.map.addControl(this.selectControl);
            this.selectControl.activate();


    // for(let i=0; i<layers.length; i++){
    //  layers[i].events.on({
    //    "featureselected": function(e) {
   //                  let feature=e.feature;
   //                  console.log(feature)
   //              }
    //  })
    // }

  }

  removeSelector(){
    this.selectControl&&this.selectControl.deactivate&&this.selectControl.deactivate();
    this.hoverControl&&this.hoverControl.deactivate&&this.hoverControl.deactivate();
  }



  addTip(position,el,options={}){
    let popup;
    var myLocation = new OpenLayers.Geometry.Point(position[0],position[1])
    setTimeout(() => {
      popup = new OpenLayers.Popup.FramedCloud("Popup",
              myLocation.getBounds().getCenterLonLat(), null,
              el.innerHTML, null,
              true // <-- true if we want a close (X) button, false otherwise
          );
      // popup.positionBlocks='tr';
      popup.panMapIfOutOfView=options.panMapIfOutOfView||true
      this.map.addPopup(popup);
    },0)
  }


  removeTip(popup){
    if(this.map.popups){
      for(let i=0; i,this.map.popups.length; i++){
        this.map.popups[i].destroy();
      }
    }

  }

  moveTo(geo,projection=this.config.projection){
    this.map.setCenter(geo);
  }

  locateTo(geo,projection=this.config.projection,layer=this.featureLayer){
    this.map.setCenter(geo);
    this.addFeature(geo,{},layer);
  }

  setZoom(zoom){
    this.map.setCenter(null,zoom);
  }

  getFeatureBy(key,value,layer){
    let features=layer.features||[];
    let feature;
    for(let i=0; i<features.length; i++){
      if(features[i].data&&features[i].data[key] == value){
        feature=features[i];
      }
    }

    return feature;
  }

  highLightFeature(feature){
    if(!feature||!feature.layer) return;
    this.hoverControl.unselectAll()
    this.hoverControl.overFeature(feature)
  }

  selectFeature(feature,multiple=false){
    if(!feature||!feature.layer) return;
    if(!multiple){
      this.selectControl.unselectAll()      
    }
    this.selectControl.select(feature)
  }

  unselectAll(){
    this.selectControl.unselectAll()
  }



  //切换到本地源
  switchToLocalSource(){
    let layer1=this.map.getLayersByName("在线底图")
    let layer2=this.map.getLayersByName("在线标注")
    if(layer1.length>0){
      this.map.removeLayer(layer1[0]);
    }
    if(layer2.length>0){
      this.map.removeLayer(layer2[0]);
    }
    addLayerToBottom([getLocalSource(this.config.localUrl1,true),getLocalSource(this.config.localUrl2)],this.map)
  }


  //切换到在线源
  switchToOnlineSource(){
    let layer1=this.map.getLayersByName("本地底图")
    let layer2=this.map.getLayersByName("本地标注")
    if(layer1.length>0){
      this.map.removeLayer(layer1[0]);
    }
    if(layer2.length>0){
      this.map.removeLayer(layer2[0]);
    }
    addLayerToBottom([getOnlineSource(this.config.onlineUrl1,true),getOnlineSource(this.config.onlineUrl2)],this.map)
  }

  switchToBaiduSource(){

  }

  setZoomListener(fn){
    this.zoomListener=fn;
  }

  removeZoomListener(){
    this.zoomListener=function(){}
  }

  addHover(mouseover,mouseout,highlightOnly=false){
    let layers=this.map.layers;
    let layersArray=[];
    for(let i=2; i<layers.length; i++){
      if(!layers[i].isBaseLayer&&layers[i] != this.featureLayer){
        layersArray.push(layers[i]);
      }
    }

    this.hoverControl = new OpenLayers.Control.SelectFeature((layersArray.length==1?(layersArray[0]):layersArray), {
      hover: true,
      highlightOnly: highlightOnly,
      renderIntent: "temp",
      onSelect: function(feature){
                      let data=OlHelper.getFeatureSelected(feature.layer);
                      if(data.length<=0) return;
                      mouseover(data,feature);
                    },
      onUnselect:function(feature){
        // let data=OlHelper.getFeatureSelected(feature.layer);
                      // if(data.length<=0) return;
                      mouseout();
      }
    });
    this.map.addControl(this.hoverControl);
    this.hoverControl.activate();
  }

  removeHover(){
    this.hoverControl.deactivate();
  }

  showLayer(layer){
    layer.setVisibility(true);
  }

  hideLayer(layer){
    layer.setVisibility(false);
  }

  getPxFromGeo(geo){

    return this.map.getPixelFromLonLat(new OpenLayers.LonLat(geo));
  }



  //transform to projection EPSG:900913
  //@params point array [lon, lat]
  _transform(point,projection=this.mapConfig.projection,direction=true){
    if(direction){
      return new OpenLayers.LonLat(point[0],point[1]).transform(new OpenLayers.Projection(projection),new OpenLayers.Projection("EPSG:900913"));
    }else{
      return new OpenLayers.LonLat(point[0],point[1]).transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection(projection));
    }
  }



 }


 function getArrayByRange(array,start,end){
    if(start > end) return []
    let newArray=[];
    for(let i=0; i<array.length; i++){
      if(i >= start &&i<=end){
        newArray.push(array[i]);
      }
    }


    return newArray;
 }

  function getFeatureData(feature){
    let f=feature;
      let coordinates=getCoodinates(f);
      let position;
      let type=OlHelper.getFeatureType(coordinates);
      if(type == OlHelper.DRAW_TYPE.Polygon){
        position=[coordinates[0][0][0],coordinates[0][0][1]];
      }else if(type == OlHelper.DRAW_TYPE.LineString){
        position=[coordinates[0][0],coordinates[0][1]];
      }else{
        position=coordinates;
      }
      return {
              coordinates,
              properties:f.data,
              position,
              type
            }

  }


  function getCoodinates(feature){
      let coordinates=[]
      let deep=0;//遍历多少层

      let traverseFeature=function(feature){
        deep++;
        let geometry=feature.geometry||feature;
        if(geometry.components){
          for(let i=0; i<geometry.components.length; i++){
            traverseFeature(geometry.components[i]);
          }
        }else{
          coordinates.push([geometry.x,geometry.y]);
        }
      };

      traverseFeature(feature);

      if(deep==1){//点
        coordinates=coordinates[0];
      }else{//多边形
        if(feature.geometry&&feature.geometry.id.indexOf("LineString")>=0){

        }else{
          coordinates=[coordinates];
        }
      }

      return coordinates;

  }


  function addLayerToBottom(layers,map){
            let otherLayers=map.layers;
            for(let i=0; i<otherLayers.length; i++){
              map.removeLayer(otherLayers[i]);
            }
            if(layers instanceof Array){
              for(let i=0; i<layers.length; i++){
                map.addLayer(layers[i]);
              }
            }else{
              map.addLayer(layers);
            }
            for(let i=0; i<otherLayers.length; i++){
              map.addLayer(otherLayers[i]);
            }
    }



//todo lineString？
const featureType={
  esriGeometryPolygon:'Polygon',
  esriGeometryPoint:'Point',
  esriGeometryLineString:'LineString',
}


//将esrijson转换为geojson
function esriToGeo(esriJson){
  let features=[];
  for(let i=0; i<esriJson.features.length; i++){
    features.push({
      type:'Feature',
      properties:{
        ...esriJson.features[i].attributes
      },
      geometry:{
        type:featureType[esriJson.geometryType],
        coordinates:esriJson.geometryType == 'esriGeometryPoint'?[esriJson.features[i].geometry.x,esriJson.features[i].geometry.y]:esriJson.features[i].geometry.rings
      }
    })
  }
  let json={
    "type": "FeatureCollection",
    features
  }
  return json;
}


export {getCoodinates}





