AntFarm.Field = Class.extend({

  objects: [],
  ids: [],

  // accepts interval in ms
  init: function(interval) {

    var field = this;

    this.setup();

    var field = this;

    this.getId = function() {
      if (field.ids.length == 0) id = 0;
      else id = field.ids[field.ids.length-1]+1;
      field.ids.push(id);
      return id;
    }

    this.run = function() {
      for (var i in field.objects) {
        field.objects[i].run();
        field.objects[i].position();
      }
    }

    this.interval = setInterval(this.run,interval);

    this.populate = function(type,num) {
      for (var i = 0; i < num; i++) {
        field.objects.push(new type(field));
      }
    }

    this.get = function(x,y) {
      var p = field.canvas.getImageData(x, y, 1, 1).data; 
      //var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
      return p;
    }
 
    this.darken = function(x,y,channel,val) {
      var pixelData = field.canvas.getImageData(x, y, 1, 1);
      pixelData.data[channel] -= val;
      field.canvas.putImageData(pixelData, x, y);
    }
 
    this.set = function(x,y,data) {
      data[3] = data[3] || 255;
      var pixelData = field.canvas.getImageData(x, y, 1, 1);
      pixelData.data[0] = data[0]; // R
      pixelData.data[1] = data[1]; // G
      pixelData.data[2] = data[2]; // B
      pixelData.data[3] = data[3]; // A
      field.canvas.putImageData(pixelData, x, y);
    }

  },

  setup: function() {

    var margin = 30;
    this.height = $(window).height()-(margin*3);
    this.width =  $(window).width() -(margin*2);
    $('.field').height(this.height);
    $('.field').width(this.width);
    $('.field').append('<canvas width="'+this.width+'" height="'+this.height+'"></canvas>');
    this.el = $('canvas');
    this.el[0].style.width = this.width+'px';
    this.el[0].style.height = this.height+'px';
    this.canvas = this.el[0].getContext('2d');
    this.canvas.fillStyle = "rgba(255,255,255,1)";
    this.canvas.fillRect(0,0,this.width,this.height);

  }

});
