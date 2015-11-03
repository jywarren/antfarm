AntFarm.Field = Class.extend({

  objects: [],
  active: {}, // for storing active grid squares in the proximity grid field.grid
  ids: [],
  margin: 30,
  time: 0,
  playing: true,

  // accepts interval in ms
  init: function(interval) {

    var field = this;

    field.setup = function() {
 
      field.height = $(window).height()-(field.margin*3);
      field.width =  $(window).width() -(field.margin*2);
      $('.field').height(field.height);
      $('.field').width(field.width);
      $('.field').append('<canvas width="'+field.width+'" height="'+field.height+'"></canvas>');
      field.el = $('canvas');
      field.el[0].style.width = field.width+'px';
      field.el[0].style.height = field.height+'px';
      field.canvas = field.el[0].getContext('2d');
      field.canvas.fillStyle = "rgba(0,0,0,1)";
      field.canvas.fillRect(0,0,field.width,field.height);
 
      // proximity grid
      field.grid = {};
      field.gridRes = 50; // meaning 1/x of pixel res
 
      // construct an empty proximity grid
      for (var x = 0; x < parseInt(field.width/field.gridRes); x++) {
        for (var y = 0; y < parseInt(field.width/field.gridRes); y++) {
          field.grid[x + ',' + y] = [];
        }
      }
 
      $('.field').on('dblclick', function(e) {
 
        field.leaf(e.offsetX, e.offsetY, 20);
 
      });
 
      $('.field').on('mousedown', function(e) {
        field.drawing = true;
      });
 
      $('.field').on('mouseup', function(e) {
        field.drawing = false;
      });
 
      $('.field').on('mousemove', function(e) {
 
        if (field.drawing) {
          var penSize = 20;
          field.canvas.fillStyle = "red";
          field.canvas.fillRect(e.offsetX - penSize/2, e.offsetY - penSize/2, penSize, penSize);
        }
 
      });
 
    }

    field.setup();

    field.editor = CodeMirror.fromTextArea($('textarea.script')[0], {
      lineNumbers: true,
      mode: 'javascript',
      theme: '3024-night'
    });

    field.getId = function() {
      if (field.ids.length == 0) id = 0;
      else id = field.ids[field.ids.length-1]+1;
      field.ids.push(id);
      return id;
    }

    field.run = function() {
      field.time += 1;
      // dim existing tracks:
      //field.canvas.fillStyle = "rgba(0,0,0,0.01)";
      //field.canvas.fillRect(0,0,field.width,field.height);
      if (field.playing) {

        field.active = {}; // flush active proximity grid squares 

        for (var i in field.objects) {
          field.objects[i].position();
          field.update(field.objects[i]); // remove old location and file new on the proximity grid
          field.objects[i].appearance();
          field.objects[i].run();
          field.active[field.objects[i].gridKey] = true;
        }

        // for each active grid cell, each neighbor triggers all others
        Object.keys(field.active).forEach(function(key, i) {
          if (field.grid[key] && field.grid[key].length > 1) {
            field.grid[key].forEach(function(obj) {
              obj.neighbors().forEach(function(neighbor) {
                if (obj.onTouch) obj.onTouch(neighbor); // trigger onTouch event
              });
            });
          }
        });
      }
    }

    field.togglePlay = function() {
      field.playing = !field.playing;
      $('.on-off i').toggleClass('fa-play');
      $('.on-off i').toggleClass('fa-pause');
    }

    field.interval = setInterval(field.run,interval);

    // update the object's entry in the proximity lookup grid in field.grid
    field.update = function(obj) {
      if (field.grid[obj.gridKey]) field.grid[obj.gridKey].splice(field.grid[obj.gridKey].indexOf(obj), 1); // remove from old prox grid position
      obj.gridKey = parseInt(obj.x / field.gridRes) + ',' + parseInt(obj.y / field.gridRes); // generate new grid key
      if (field.grid[obj.gridKey]) field.grid[obj.gridKey].push(obj);
    }

    // add just one <type> to field.objects
    field.add = function(type) {
      field.objects.push(new type(field));
      return field.objects[field.objects.length - 1];
    }

    // add a bunch of <type> to field.objects
    field.populate = function(type,num) {
      var newObjects = [];
      for (var i = 0; i < num; i++) {
        field.objects.push(new type(field));
        newObjects.push(field.objects[field.objects.length - 1]);
      }
      return newObjects;
    }

    // [r,g,b,a] where each can be 0-255
    // needs color revision
    field.get = function(x,y) {
      // field.is a common spot where the system crashes, so intifying:
      x = parseInt(x);
      y = parseInt(y);
      var p = field.canvas.getImageData(x, y, 1, 1).data; 
      //var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
      return p;
    }

    field.color = function(x, y, color, val) {
      var colors = ["red", "green", "blue", "alpha"],
          px = field.get(x, y);

      if (typeof val !== "undefined") {
        px[colors.indexOf(color)] = val;
        field.set(x, y, px);
      }
      return px[colors.indexOf(color)];
    }

    field.red = function(x, y, val) {
      var px = field.get(x, y);
      if (typeof val !== "undefined") field.color(x, y, "red", val);
      return px[0];
    }

    field.green = function(x, y, val) {
      var px = field.get(x, y);
      if (typeof val !== "undefined") field.color(x, y, "green", val);
      return px[1];
    }

    field.blue = function(x, y, val) {
      var px = field.get(x, y);
      if (typeof val !== "undefined") field.color(x, y, "blue", val);
      return px[2];
    }

    field.alpha = function(x, y, val) {
      var px = field.get(x, y);
      if (typeof val !== "undefined") field.color(x, y, "alpha", val);
      return px[3];
    }

    field.trailRed = function(x, y, val) {
      field.trail(x, y, "red", val);
    }

    field.trailGreen = function(x, y, val) {
      field.trail(x, y, "green", val);
    }

    field.trailBlue = function(x, y, val) {
      field.trail(x, y, "blue", val);
    }

    field.trailAlpha = function(x, y, val) {
      field.trail(x, y, "alpha", val);
    }
 
    field.trail = function(x,y,channel,val) {
      var pixelData = field.canvas.getImageData(x, y, 1, 1),
          colors = ["red", "green", "blue", "alpha"];
      pixelData.data[colors.indexOf(channel)] += val;
      field.canvas.putImageData(pixelData, x, y);
    }
 
    field.set = function(x, y, data) {
      data[3] = data[3] || 255;
      var pixelData = field.canvas.getImageData(x, y, 1, 1);
      pixelData.data[0] = data[0]; // R
      pixelData.data[1] = data[1]; // G
      pixelData.data[2] = data[2]; // B
      pixelData.data[3] = data[3]; // A
      field.canvas.putImageData(pixelData, x, y);
    }

    field.leaf = function(x, y, leafSize) {
      field.canvas.fillStyle = "rgba(0,255,0,1)";
      field.canvas.fillRect(x - leafSize/2, y - leafSize/2, leafSize, leafSize);
    }

  }

});
