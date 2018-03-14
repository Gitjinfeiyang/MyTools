/**
 * Created by Jinfeiyang on 2017-1-18.
 */

 //openlayers3




          function addLayerToBottom(layers,map){
            let otherLayers=map.getLayers();
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




          const REDICON='../../static/redicon.png';//图标

          //样式
          const NORMAL_ICON=new ol.style.Icon({
            src: REDICON,
            opacity:0.8,
          });
          const NORMAL_ICON_HOVER=new ol.style.Icon({
            src: REDICON,
            opacity:1,
          });
          const NORMAL_ICON_SELECTED=new ol.style.Icon({
            src: REDICON,
            scale:1.2,
            opacity:1,
          })
          const NORMAL_STYLE=new ol.style.Style({
                  fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                  }),
                  stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                  }),
                  image: NORMAL_ICON
                })

          const SELECT_STYLE=new ol.style.Style({
                  image:NORMAL_ICON_SELECTED,
                  fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.5)'
                  }),
                  stroke: new ol.style.Stroke({
                    color: '#ff0000',
                    width: 2
                  }),
                })

          const HOVER_STYLE=new ol.style.Style({
                  image:NORMAL_ICON_HOVER,
                  fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.5)'
                  }),
                  stroke: new ol.style.Stroke({
                    color: '#ff0',
                    width: 2
                  }),
                })

          const CLUSTER_STYLE=function(size){
            return new ol.style.Style({
                        image: new ol.style.Circle({
                          radius: 10,
                          stroke: new ol.style.Stroke({
                            color: '#fff'
                          }),
                          fill: new ol.style.Fill({
                            color: '#3399CC'
                          })
                        }),
                        text: new ol.style.Text({
                          text: size.toString(),
                          fill: new ol.style.Fill({
                            color: '#fff'
                          })
                        })
                      });
          }


          var getText = function(feature) {
            var text = feature.get('name');

            return text;
          };







          var source = new ol.source.OSM();

          const onlineUrl1="http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}";//底图
          const onlineUrl2='http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}';//文字标注

          const localUrl1="http://10.12.102.136/tiles/map/L{z}/R{y}/C{x}.png";//底图
          const localUrl2="http://10.12.102.136/tiles/point/L{z}/R{y}/C{x}.png";//文字标注

          var source1=new ol.source.XYZ({
                        url: onlineUrl1
                    });
          var source2=new ol.source.XYZ({
                        url: onlineUrl2
                      });





            var projection = ol.proj.get('EPSG:4326');
            var projectionExtent = projection.getExtent();
            var size = ol.extent.getWidth(projectionExtent) / 256;
            var resolutions = new Array(17);
            var matrixIds = new Array(17);
            for (var z = 0; z < 17; ++z) {
              // generate resolutions and matrixIds arrays for this WMTS
              resolutions[z] = size / Math.pow(2, z);
              matrixIds[z] = z;
            }

            let localTileLayer1= new ol.layer.Tile({
              source: new ol.source.WMTS({
                url: 'http://10.12.102.136/tiles/map/L{TileMatrix}/R{TileRow}/C{TileCol}.png',
                // tileUrlFunction:tileUrlFunction1,
                layer: 'geolandbasemap',
                requestEncoding: "REST",
                format: 'image/png',
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                  origin: ol.extent.getTopLeft(projectionExtent),
                  resolutions: resolutions,
                  matrixIds: matrixIds
                }),
              })
            });
            let localTileLayer2= new ol.layer.Tile({
              source: new ol.source.WMTS({
                url: 'http://10.12.102.136/tiles/point/L{TileMatrix}/R{TileRow}/C{TileCol}.png',
                // tileUrlFunction:tileUrlFunction2,
                layer: 'geolandbasemap',
                requestEncoding: "REST",
                format: 'image/png',
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                  origin: ol.extent.getTopLeft(projectionExtent),
                  resolutions: resolutions,
                  matrixIds: matrixIds
                }),
              })
            });

            let onlineTile1=new ol.layer.Tile({
              source:source1,
            });
            let onlineTile2=new ol.layer.Tile({
              source:source2,
            });



























//加载百度tile
var forEachPoint = function(func) {
  return function(input, opt_output, opt_dimension) {
    var len = input.length;
    var dimension = opt_dimension ? opt_dimension : 2;
    var output;
    if (opt_output) {
      output = opt_output;
    } else {
      if (dimension !== 2) {
        output = input.slice();
      } else {
        output = new Array(len);
      }
    }
    for (var offset = 0; offset < len; offset += dimension) {
      func(input, output, offset)
    }
    return output;
  };
};

var sphericalMercator = {}

var RADIUS = 6378137;
var MAX_LATITUDE = 85.0511287798;
var RAD_PER_DEG = Math.PI / 180;

sphericalMercator.forward = forEachPoint(function(input, output, offset) {
  var lat = Math.max(Math.min(MAX_LATITUDE, input[offset + 1]), -MAX_LATITUDE);
  var sin = Math.sin(lat * RAD_PER_DEG);

  output[offset] = RADIUS * input[offset] * RAD_PER_DEG;
  output[offset + 1] = RADIUS * Math.log((1 + sin) / (1 - sin)) / 2;
});

sphericalMercator.inverse = forEachPoint(function(input, output, offset) {
  output[offset] = input[offset] / RADIUS / RAD_PER_DEG;
  output[offset + 1] = (2 * Math.atan(Math.exp(input[offset + 1] / RADIUS)) - (Math.PI / 2)) / RAD_PER_DEG;
});


var baiduMercator = {}

var MCBAND = [12890594.86, 8362377.87,
    5591021, 3481989.83, 1678043.12, 0];

var LLBAND = [75, 60, 45, 30, 15, 0];

var MC2LL = [
    [1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331,
        200.9824383106796, -187.2403703815547, 91.6087516669843,
        -23.38765649603339, 2.57121317296198, -0.03801003308653,
        17337981.2],
    [-7.435856389565537e-9, 0.000008983055097726239,
        -0.78625201886289, 96.32687599759846, -1.85204757529826,
        -59.36935905485877, 47.40033549296737, -16.50741931063887,
        2.28786674699375, 10260144.86],
    [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616,
        59.74293618442277, 7.357984074871, -25.38371002664745,
        13.45380521110908, -3.29883767235584, 0.32710905363475,
        6856817.37],
    [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591,
        40.31678527705744, 0.65659298677277, -4.44255534477492,
        0.85341911805263, 0.12923347998204, -0.04625736007561,
        4482777.06],
    [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062,
        23.10934304144901, -0.00023663490511, -0.6321817810242,
        -0.00663494467273, 0.03430082397953, -0.00466043876332,
        2555164.4],
    [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8,
        7.47137025468032, -0.00000353937994, -0.02145144861037,
        -0.00001234426596, 0.00010322952773, -0.00000323890364,
        826088.5]];

var LL2MC = [
    [-0.0015702102444, 111320.7020616939, 1704480524535203,
        -10338987376042340, 26112667856603880,
        -35149669176653700, 26595700718403920,
        -10725012454188240, 1800819912950474, 82.5],
    [0.0008277824516172526, 111320.7020463578, 647795574.6671607,
        -4082003173.641316, 10774905663.51142, -15171875531.51559,
        12053065338.62167, -5124939663.577472, 913311935.9512032,
        67.5],
    [0.00337398766765, 111320.7020202162, 4481351.045890365,
        -23393751.19931662, 79682215.47186455, -115964993.2797253,
        97236711.15602145, -43661946.33752821, 8477230.501135234,
        52.5],
    [0.00220636496208, 111320.7020209128, 51751.86112841131,
        3796837.749470245, 992013.7397791013, -1221952.21711287,
        1340652.697009075, -620943.6990984312, 144416.9293806241,
        37.5],
    [-0.0003441963504368392, 111320.7020576856, 278.2353980772752,
        2485758.690035394, 6070.750963243378, 54821.18345352118,
        9540.606633304236, -2710.55326746645, 1405.483844121726,
        22.5],
    [-0.0003218135878613132, 111320.7020701615, 0.00369383431289,
        823725.6402795718, 0.46104986909093, 2351.343141331292,
        1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]];


function getRange(v, min, max) {
  v = Math.max(v, min);
  v = Math.min(v, max);

  return v;
}

function getLoop(v, min, max) {
  var d = max - min;
  while (v > max) {
    v -= d;
  }
  while (v < min) {
    v += d;
  }

  return v;
}

function convertor(input, output, offset, table) {
  var px = input[offset];
  var py = input[offset + 1];
  var x = table[0] + table[1] * Math.abs(px);
  var d = Math.abs(py) / table[9];
  var y = table[2]
      + table[3]
      * d
      + table[4]
      * d
      * d
      + table[5]
      * d
      * d
      * d
      + table[6]
      * d
      * d
      * d
      * d
      + table[7]
      * d
      * d
      * d
      * d
      * d
      + table[8]
      * d
      * d
      * d
      * d
      * d
      * d;

  output[offset] = x * (px < 0 ? -1 : 1);
  output[offset + 1] = y * (py < 0 ? -1 : 1);
}

baiduMercator.forward = forEachPoint(function(input, output, offset) {
  var lng = getLoop(input[offset], -180, 180);
  var lat = getRange(input[offset + 1], -74, 74);

  var table = null;
  var j;
  for (j = 0; j < LLBAND.length; ++j) {
    if (lat >= LLBAND[j]) {
      table = LL2MC[j];
      break;
    }
  }
  if (table === null) {
    for (j = LLBAND.length - 1; j >= 0; --j) {
      if (lat <= -LLBAND[j]) {
        table = LL2MC[j];
        break;
      }
    }
  }
  output[offset] = lng;
  output[offset + 1] = lat;
  convertor(output, output, offset, table);
});

baiduMercator.inverse = forEachPoint(function(input, output, offset) {
  var y_abs = Math.abs(input[offset + 1]);

  var table = null;
  for (var j = 0; j < MCBAND.length; j++) {
    if (y_abs >= MCBAND[j]) {
      table = MC2LL[j];
      break;
    }
  }

  convertor(input, output, offset, table);
});

var gcj02 = {}

var PI = Math.PI;
var AXIS = 6378245.0;
var OFFSET = 0.00669342162296594323;  // (a^2 - b^2) / a^2

function delta(wgLon, wgLat) {
  var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
  var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
  var radLat = wgLat / 180.0 * PI;
  var magic = Math.sin(radLat);
  magic = 1 - OFFSET * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((AXIS * (1 - OFFSET)) / (magic * sqrtMagic) * PI);
  dLon = (dLon * 180.0) / (AXIS / sqrtMagic * Math.cos(radLat) * PI);
  return [dLon, dLat];
}

function outOfChina(lon, lat) {
  if (lon < 72.004 || lon > 137.8347) {
    return true;
  }
  if (lat < 0.8293 || lat > 55.8271) {
    return true;
  }
  return false;
}

function transformLat(x, y) {
  var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformLon(x, y) {
  var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

gcj02.toWGS84 = forEachPoint(function(input, output, offset) {
  var lng = input[offset];
  var lat = input[offset + 1];
  if (!outOfChina(lng, lat)) {
    var deltaD = delta(lng, lat);
    lng = lng - deltaD[0];
    lat = lat - deltaD[1];
  }
  output[offset] = lng;
  output[offset + 1] = lat;
});

gcj02.fromWGS84 = forEachPoint(function(input, output, offset) {
  var lng = input[offset];
  var lat = input[offset + 1];
  if (!outOfChina(lng, lat)) {
    var deltaD = delta(lng, lat);
    lng = lng + deltaD[0];
    lat = lat + deltaD[1];
  }
  output[offset] = lng;
  output[offset + 1] = lat;
});

var bd09 = {}

var PI = Math.PI;
var X_PI = PI * 3000 / 180;

function toGCJ02(input, output, offset) {
  var x = input[offset] - 0.0065;
  var y = input[offset + 1] - 0.006;
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  output[offset] = z * Math.cos(theta);
  output[offset + 1] = z * Math.sin(theta);
  return output;
}

function fromGCJ02(input, output, offset) {
  var x = input[offset];
  var y = input[offset + 1];
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
  output[offset] = z * Math.cos(theta) + 0.0065;
  output[offset + 1] = z * Math.sin(theta) + 0.006;
  return output;
}

bd09.toWGS84 = function(input, opt_output, opt_dimension) {
  var output = forEachPoint(toGCJ02)(input, opt_output, opt_dimension);
  return gcj02.toWGS84(output, output, opt_dimension);
};

bd09.fromWGS84 = function(input, opt_output, opt_dimension) {
  var output = gcj02.fromWGS84(input, opt_output, opt_dimension);
  return forEachPoint(fromGCJ02)(output, output, opt_dimension);
};


var projzh = {}

projzh.smerc2bmerc = function(input, opt_output, opt_dimension) {
  var output = sphericalMercator.inverse(input, opt_output, opt_dimension);
  output = bd09.fromWGS84(output, output, opt_dimension);
  return baiduMercator.forward(output, output, opt_dimension);
};

projzh.bmerc2smerc = function(input, opt_output, opt_dimension) {
  var output = baiduMercator.inverse(input, opt_output, opt_dimension);
  output = bd09.toWGS84(output, output, opt_dimension);
  return sphericalMercator.forward(output, output, opt_dimension);
};

projzh.bmerc2ll = function(input, opt_output, opt_dimension) {
  var output = baiduMercator.inverse(input, opt_output, opt_dimension);
  return bd09.toWGS84(output, output, opt_dimension);
};

projzh.ll2bmerc = function(input, opt_output, opt_dimension) {
  var output = bd09.fromWGS84(input, opt_output, opt_dimension);
  return baiduMercator.forward(output, output, opt_dimension);
};

projzh.ll2smerc = sphericalMercator.forward;
projzh.smerc2ll = sphericalMercator.inverse;



var extent = [72.004, 0.8293, 137.8347, 55.8271];

var baiduMercatorProj = new ol.proj.Projection({
  code: 'baidu',
  extent: ol.extent.applyTransform(extent, projzh.ll2bmerc),
  units: 'm'
});

ol.proj.addProjection(baiduMercatorProj);
ol.proj.addCoordinateTransforms('EPSG:4326', baiduMercatorProj, projzh.ll2bmerc, projzh.bmerc2ll);
ol.proj.addCoordinateTransforms('EPSG:3857', baiduMercatorProj, projzh.smerc2bmerc, projzh.bmerc2smerc);

var bmercResolutions = new Array(19);
for (var i = 0; i < 19; ++i) {
  bmercResolutions[i] = Math.pow(2, 18 - i);
}
var baidu = new ol.layer.Tile({
  source: new ol.source.XYZ({
    projection: 'baidu',
    maxZoom: 18,
    tileUrlFunction: function(tileCoord) {
      var x = tileCoord[1];
      var y = tileCoord[2];
      var z = tileCoord[0];
      return "http://api1.map.bdimg.com/customimage/tile?x=" + x
        + "&y=" + y + "&z=" + z
        + "&udt=20170908&scale=2&ak=ZUONbpqGBsYGXNIYHicvbAbM"
        + "&styles=pl";;
    },
    tileGrid: new ol.tilegrid.TileGrid({
      resolutions: bmercResolutions,
      origin: [0, 0],
      extent: ol.extent.applyTransform(extent, projzh.ll2bmerc),
      tileSize: [256, 256]
    })
  })
});
































// 120.19634932279587
// 30.203282833099365

          export default class OlHelper3 {

            static DRAW_TYPE={
              Polygon:'Polygon',
              LineString:'LineString',
              Point:'Point',
              Box:'Box',
              Circle:'Circle',
              Modify:'Modify',
            }

            static MODIFY_MODE={
              reshape:1,
              rotate:2,
              resize:3,
              drag:4,
            } 

            static selectPointerMove=new ol.interaction.Select({
                condition: ol.events.condition.pointerMove,
                style:function(feature){
                    return HOVER_STYLE;
                }
              });

              static select=new ol.interaction.Select({
                condition: ol.events.condition.singleClick,
                style:function(feature){
                    return SELECT_STYLE;
                }
              });


            constructor(options,config={}){
              let center={
                x:120.4907512664795,
                y:30.08481502532959
              }

               let defaultConfig={
                center:[center.x,center.y],
                zoom:12,
                minZoom:10,
                maxZoom:20,
                extent:[center.x-0.05,center.y-0.05,center.x+0.02,center.y+0.02]
              };
              this.config=extend(defaultConfig,config);
              this.config.extent=[this.config.center[0]-0.05,this.config.center[1]-0.05,this.config.center[0]+0.02,this.config.center[1]+0.02]

              let defaultOptions={
                layers: [
                  onlineTile1,
                  onlineTile2
                ],
                target:'map',
                view: new ol.View({
                  center:this.config.center,
                  projection:'EPSG:4326',
                  zoom: this.config.zoom,
                  minZoom:this.config.minZoom,
                  maxZoom:this.config.maxZoom,
                  // extent:this.config.extent
                }),
              };
              this.options=extend(defaultOptions,options);

              this.map={}; //存储ol实例

              this.drawInteraction={} //绘制交互

              this.featureSource=new ol.source.Vector({
                // url: './js/points.geojson',
                format: new ol.format.GeoJSON()
              }); //载入feature source

              //放置featrues的layer
              this.featureLayer=new ol.layer.Vector({ //载入feature layer
                source: this.featureSource,
                style: NORMAL_STYLE
              });

              this.select=OlHelper3.select;
              this.selectPointerMove=OlHelper3.selectPointerMove;

              this.init()
            }


            //实例化ol
            init(){
              this.map = new ol.Map(this.options);
              this.addFeatureLayer()
            }



            //启用绘制层
            enableDraw(type='Polygon',callback=function(event){},layer=this.featureLayer){
              this.disableDraw()
              let source=layer.getSource()
              this.removeSelector();
              this.drawInteraction=new ol.interaction.Draw({
                type: type,
                source:source ,    // 注意设置source，这样绘制好的线，就会添加到这个source里
                // style: new ol.style.Style({            // 设置绘制时的样式
                //     stroke: new ol.style.Stroke({
                //         color: '#009933',
                //         size: 1
                //     })
                // }),
                // maxPoints: 4    // 限制不超过4个点
              });
              // 监听线绘制结束事件，获取坐标
              this.drawInteraction.on('drawend', function(event){
                // event.feature 就是当前绘制完成的线的Feature
                callback(event.feature.getGeometry().getCoordinates());
              });

              let snap=new ol.interaction.Snap({source:source})
              let modify= new ol.interaction.Modify({source: source});;

              this.map.addInteraction(this.drawInteraction);
              this.map.addInteraction(snap);
              this.map.addInteraction(modify);
            }





            //移除绘制层
            disableDraw(){
              if(this.drawInteraction){
                this.map.removeInteraction(this.drawInteraction);
                this.map.removeInteraction(this.snap);
              }
            }





            //添加放置featrues的layer
            addFeatureLayer(){
              this.map.addLayer(this.featureLayer);
            }





            //移除放置featrues的layer
            removeFeatureLayer(){
              this.map.removeLayer(this.featureLayer);
            }





            addLayer(options={}){
              let defaultOptions={ //载入feature layer
                source: new ol.source.Vector({
                            format: new ol.format.GeoJSON()
                          }),
                style: NORMAL_STYLE
              };
              defaultOptions=extend(defaultOptions,options)
              let layer=new ol.layer.Vector(defaultOptions);
              this.map.addLayer(layer);
              return layer;
            }




            removeLayer(layer){
              this.map.removeLayer(layer);
            }




            addEsriLayer(options={}){
              let styleCache={};
              let defaultOptions={
                      source:new ol.source.Cluster({
                          distance: 12,
                          source:new ol.source.Vector({
                            format: new ol.format.EsriJSON()
                          }) 
                        }),
                      style: function(feature) {
                              var size = feature.get('features').length;
                              var style = styleCache[size];
                              if (!style) {
                                style = CLUSTER_STYLE(size)
                                styleCache[size] = style;
                              }
                              if(size<=1){
                                style=NORMAL_STYLE;
                              }
                              return style;
                            }
                        };
              defaultOptions=extend(defaultOptions,options);
              return this.addLayer(defaultOptions);
            }





            addPolygonLayer(options={}){
              let defaultOptions={
                      source:new ol.source.Vector({
                        format: new ol.format.EsriJSON()
                      }),
              };
              defaultOptions=extend(defaultOptions,options);
              return this.addLayer(defaultOptions);
            }




            //添加featrues
            addFeatures(json={
                          "type": "FeatureCollection",
                          "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

                          "features": [
                            { "type": "Feature", "properties": { "name": "钱塘江","events":"5" }, "geometry": { "type": "Polygon", "coordinates":[[[120.13225793838501,30.199570655822754],[120.13663530349731,30.190987586975098],[120.14942407608032,30.194334983825684],[120.15723466873169,30.194807052612305],[120.1599383354187,30.19566535949707],[120.16525983810425,30.197510719299316],[120.16676187515259,30.197596549987793],[120.16817808151245,30.197982788085938],[120.17023801803589,30.19965648651123],[120.17229795455933,30.200514793395996],[120.17513036727905,30.202574729919434],[120.1769757270813,30.204076766967773],[120.17813444137573,30.204334259033203],[120.17156839370728,30.214591026306152],[120.15826463699341,30.207767486572266],[120.1504111289978,30.204720497131348],[120.14646291732788,30.203776359558105],[120.14333009719849,30.202789306640625],[120.1410984992981,30.201973915100098],[120.13487577438354,30.20064353942871],[120.13225793838501,30.199570655822754]]]} },
                            { "type": "Feature", "properties": { "name": "杭州" }, "geometry": { "type": "Point", "coordinates": [120.19,30.26] } },
                            { "type": "Feature", "properties": { "name": "杭州旁边" }, "geometry": { "type": "Point", "coordinates": [120.18,30.27] } }
                            ]
                        },layer=this.featureLayer){
              //加载绘图
              var vectorLayer = layer;
              var source=layer.getSource();

              if(source.getFormat()){
                source.addFeatures(source.getFormat().readFeatures(json));                
              }else{
                source.getSource().addFeatures(source.getSource().getFormat().readFeatures(json))
              }

              return vectorLayer;
            }



            addFeatureWithText(){

            }


            //清除所有features
            removeFeatures(layer=this.featrueLayer){
              if(layer&&layer.getSource&&layer.getSource()){
                layer.getSource().clear() //载入feature source                
              }
            }


            //添加选中feature功能
            //@return {coodinates,properties,position}
            addSelector(callback=function(coodinates){}){
              // 选中区域
              var self=this;
              
              this.map.addInteraction(this.selectPointerMove);
              this.map.addInteraction(this.select);

              this.select.on('select', function(e) {
                  // var coodinates=ol.proj.transform(self.map.getEventCoordinate(e), 'EPSG:3857', 'EPSG:4326');
                  var coodinates=[];
                  var properties={};
                  var position=[];//center
                  if(e.selected&&e.selected[0]){
                    coodinates=e.selected[0].getGeometry().getCoordinates();
                    properties=e.selected[0].getProperties();
                    var aa = e.selected[0].getGeometry().getExtent();
                    position = ol.extent.getCenter(aa);
                    callback({coodinates:coodinates,properties:properties,position:position});
                  }
              });
            }


            //添加tip
            addTip(position,ele){
              var overlay = new ol.Overlay({
                element: ele,
                offset: [0, -20],
                positioning:'bottom-center'
              });
              this.map.addOverlay(overlay);
              overlay.setPosition(position)
              return overlay;
            }


            //移除tip
            removeTip(overlay){
              this.map.removeOverlay(overlay);
            }


            //移除选中功能
            removeSelector(){
              this.map.removeInteraction(this.selectPointerMove);
              this.map.removeInteraction(this.select);
            }




            //将地图中心移动到
            moveTo(geo,coordinateSystem){
              //定位到点
              var view = this.map.getView();
              // 设置地图中心为成都的坐标，即可让地图移动到成都
              // view.setCenter(geo);
              view.animate({
                center:geo,
                duration:800,
                easing:ol.easing.easeInOut
              })
              // this.map.render();
            }




            //定位到并且显示图标
            locateTo(geo,coordinateSystem){
              this.removeFeatures();
              var view=this.map.getView();
              var coordinates = ol.proj.transform(geo,coordinateSystem,'EPSG:4326');
              // var coordinates = geo;
              view.setCenter(coordinates);
              var anchor = new ol.Feature({
                type:'Point',
                geometry: new ol.geom.Point(coordinates)
              });
              // 设置样式，在样式中就可以设置图标
              anchor.setStyle(new ol.style.Style({
                image: NORMAL_ICON
              }));
              // 添加到之前的创建的layer中去
              this.featureLayer.getSource().addFeature(anchor);
            }




            //设置缩放
            setZoom(zoom){
              let view=this.map.getView();
              view.animate({
                zoom:zoom,
                duration:800,
                easing:ol.easing.easeInOut
              })
            }




            //切换到本地源
            switchToLocalSource(){
              // source1.setUrl(localUrl1);
              // source2.setUrl(localUrl2);
              this.map.removeLayer(onlineTile1);
              this.map.removeLayer(onlineTile2);
              this.map.addLayer(localTileLayer1);
              this.map.addLayer(localTileLayer2);
              this.removeFeatureLayer();
              this.addFeatureLayer()
            }



            //切换到在线源
            switchToOnlineSource(){
              // source1.setUrl(onlineUrl1);
              // source2.setUrl(onlineUrl2);
              this.map.addLayer(onlineTile1);
              this.map.addLayer(onlineTile2);
              this.map.removeLayer(localTileLayer1);
              this.map.removeLayer(localTileLayer2);
              this.removeFeatureLayer();
              this.addFeatureLayer()
            }

            switchToBaiduSource(){
              this.map.removeLayer(onlineTile1);
              this.map.removeLayer(onlineTile2);
              this.map.removeLayer(localTileLayer1);
              this.map.removeLayer(localTileLayer2);
              addLayerToBottom(baidu,this.map);
              // this.map.getView().setProjection('EPSG:3857');
            }


          }






