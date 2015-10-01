AntFarm.Field = Class.extend({

  objects: [],
  ids: [],
  margin: 30,
  time: 0,
  playing: true,

  // accepts interval in ms
  init: function(interval) {

    var field = this;

    this.setup();

    var field = this;

    field.editor = CodeMirror.fromTextArea($('textarea.script')[0], {
      lineNumbers: true,
      mode: 'javascript',
      theme: '3024-night'
    });

    this.getId = function() {
      if (field.ids.length == 0) id = 0;
      else id = field.ids[field.ids.length-1]+1;
      field.ids.push(id);
      return id;
    }

    this.run = function() {
      field.time += 1;
      // dim existing tracks:
      field.canvas.fillStyle = "rgba(0,0,0,0.01)";
      field.canvas.fillRect(0,0,field.width,field.height);
      if (field.playing) {
        for (var i in field.objects) {
          field.objects[i].position();
          field.objects[i].appearance();
          field.objects[i].run();
        }
      }
    }

    this.togglePlay = function() {
      field.playing = !field.playing;
      $('.on-off i').toggleClass('fa-play');
      $('.on-off i').toggleClass('fa-pause');
    }

    this.interval = setInterval(this.run,interval);

    // add just one <type> to field.objects
    this.add = function(type) {
      field.objects.push(new type(field));
      return field.objects[field.objects.length - 1];
    }

    // add a bunch of <type> to field.objects
    this.populate = function(type,num) {
      var newObjects = [];
      for (var i = 0; i < num; i++) {
        field.objects.push(new type(field));
        newObjects.push(field.objects[field.objects.length - 1]);
      }
      return newObjects;
    }

    // [r,g,b,a] where each can be 0-255
    // needs color revision
    this.get = function(x,y) {
      var p = field.canvas.getImageData(x, y, 1, 1).data; 
      //var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
      return p;
    }

    this.color = function(x, y, color, val) {
      var colors = ["red", "green", "blue", "alpha"],
          px = field.get(x, y);

      if (typeof val !== "undefined") {
        px[colors.indexOf(color)] = val;
        field.set(x, y, px);
      }
      return px[colors.indexOf(color)];
    }

    this.red = function(x, y, val) {
      var px = field.get(x, y);
      if (typeof val !== "undefined") field.color(x, y, "red", val);
      return px[0];
    }

    this.green = function(x, y, val) {
      var px = field.get(x, y);
      if (typeof val !== "undefined") field.color(x, y, "green", val);
      return px[1];
    }

    this.blue = function(x, y, val) {
      var px = field.get(x, y);
      if (typeof val !== "undefined") field.color(x, y, "blue", val);
      return px[2];
    }

    this.alpha = function(x, y, val) {
      var px = field.get(x, y);
      if (typeof val !== "undefined") field.color(x, y, "alpha", val);
      return px[3];
    }

    this.trailRed = function(x, y, val) {
      this.trail(x, y, "red", val);
    }

    this.trailGreen = function(x, y, val) {
      this.trail(x, y, "green", val);
    }

    this.trailBlue = function(x, y, val) {
      this.trail(x, y, "blue", val);
    }

    this.trailAlpha = function(x, y, val) {
      this.trail(x, y, "alpha", val);
    }
 
    this.trail = function(x,y,channel,val) {
      var pixelData = field.canvas.getImageData(x, y, 1, 1),
          colors = ["red", "green", "blue", "alpha"];
      pixelData.data[colors.indexOf(channel)] += val;
      field.canvas.putImageData(pixelData, x, y);
    }
 
    this.set = function(x, y, data) {
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

    this.height = $(window).height()-(this.margin*3);
    this.width =  $(window).width() -(this.margin*2);
    $('.field').height(this.height);
    $('.field').width(this.width);
    $('.field').append('<canvas width="'+this.width+'" height="'+this.height+'"></canvas>');
    this.el = $('canvas');
    this.el[0].style.width = this.width+'px';
    this.el[0].style.height = this.height+'px';
    this.canvas = this.el[0].getContext('2d');
    this.canvas.fillStyle = "rgba(0,0,0,1)";
    this.canvas.fillRect(0,0,this.width,this.height);

    $('.field').on('dblclick', function(e) {

      var leafSize = 20;
      field.canvas.fillStyle = "rgba(0,255,0,1)";
      //console.log(e.offsetX, e.offsetY, e.offsetX - leafSize/2, e.offsetY - leafSize/2, leafSize, leafSize);
      field.canvas.fillRect(e.offsetX - leafSize/2, e.offsetY - leafSize/2, leafSize, leafSize);

    });

  }

});
