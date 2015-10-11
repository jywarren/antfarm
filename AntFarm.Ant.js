AntFarm.Ant = Class.extend({

  intervals: [],

// tweak indents to look right in editor:
  program: "onRun = function() {\n\n  ant.direction += Math.random()*10-5;\n  ant.trail('blue', 255); // color, amount\n\n}\n\nonBump = function() {\n\n  ant.direction += 90;\n\n}\n",

  init: function(field) {

    this.id = field.getId();
    $('.field').append('<div class="ant ant-'+this.id+'"><i class="fa fa-chevron-up"></i></div>');
    this.el = $('.ant-'+id);
    this.x = parseInt(Math.random()*field.width);
    this.y = parseInt(Math.random()*field.height);
    this.age = 0;
    this.energy = 100;
    this.width = 12;
    this.height = 12;
    this.speed = 2;
    this.direction = Math.random()*360;
    this.color = "white";

    var ant = this;

    // runs just after run()
    ant.position = function() {
      ant.bump = false;

      // limit to bounds
      if (ant.x > field.width) { 
        ant.bump = true;
        ant.x = field.width;
      }
      if (ant.y > field.height) {
        ant.bump = true;
        ant.y = field.height;
      }
      if (ant.x < 0) {
        ant.bump = true;
        ant.x = 0;
      }
      if (ant.y < 0) {
        ant.bump = true;
        ant.y = 0;
      }

      // move with trigonometry; set up to zero
      ant.x += Math.sin((-ant.direction + 180) / 180 * Math.PI) * ant.speed;
      ant.y += Math.cos((-ant.direction + 180) / 180 * Math.PI) * ant.speed;
 
      // set position
      ant.el.css('left', ant.x-(ant.width/2)+'px');
      ant.el.css('top',  ant.y-(ant.height/2)+'px');

      // rotation
      // webkit, e.g. chrome/safari
      ant.el.css({ WebkitTransform: 'rotate(' + parseInt(ant.direction) + 'deg)'});

      // For Mozilla browser: e.g. Firefox
      ant.el.css({ '-moz-transform': 'rotate(' + parseInt(ant.direction) + 'deg)'});

      if (ant.direction > 360) ant.direction -= 360;
      if (ant.direction < 0) ant.direction += 360;

      return ant;

    }


    // grows ant by pixels dimension
    ant.grow = function(pixels) {

      ant.height += pixels;
      ant.width += pixels;

    }


    ant.distance = function() {

      // Overload!
      if (arguments[0] instanceof Array) {

        var x = arguments[0][0],
            y = arguments[0][1];

      } else if (arguments[0] instanceof Object) {

        var x = arguments[0].x,
            y = arguments[0].y;

      } else {

        var x = arguments[0],
            y = arguments[1];
      }

      return Math.sqrt(Math.pow(ant.x - x, 2) + Math.pow(ant.y - y, 2));

    }


    ant.trail = function(color, value) {
      return field.trail(ant.x, ant.y, color, value);
    }


    ant.red = function(val) {
      return field.red(ant.x, ant.y, val);
    }


    ant.green = function(val) {
      return field.green(ant.x, ant.y, val);
    }


    ant.blue = function(val) {
      return field.blue(ant.x, ant.y, val);
    }


    ant.alpha = function(val) {
      return field.alpha(ant.x, ant.y, val);
    }


    // replace ant with green 'food'
    ant.die = function() {
      ant.remove();

      field.canvas.save();
        // to do rotation, we need a better origin
        // field.canvas.rotate(ant.direction / 180 * Math.PI);
        field.canvas.fillStyle = "green";
        field.canvas.fillRect(ant.x - ant.width/2, ant.y - ant.height/2, ant.width, ant.height);
      field.canvas.restore();
    }


    // runs <callback> every <seconds>
    ant.every = function(seconds, callback) {
      // this isn't right -- it should run only when the clock is running. 
      var interval = setInterval(callback, seconds * 1000);
      ant.intervals.push(interval);
      return interval;
    }


    // point the ant at an object which has x, y properties
    ant.point = function(target) {

      // Overload!
      if (arguments[0] instanceof Array) {

        var x = arguments[0][0],
            y = arguments[0][1];

      } else if (arguments[0] instanceof Object) {

        var x = arguments[0].x,
            y = arguments[0].y;

      } else {

        var x = arguments[0],
            y = arguments[1];
      }

      // trig
      ant.direction = parseInt(Math.atan((x - ant.x) / (y - ant.y + 0.01)) / Math.PI * -180); // quick fix for division by zero; add 0.01

      // because I am bad at math, i don't know why this is necessary:
      if (ant.y < y) ant.direction += 180;

    }


    // Look <dist> pixels in each direction 
    // (forming a square) for "red", "green" or "blue"
    // and returns an angle direction (currently only 0, 90, 180, 270).
    // Also accepts <res> -- search can be every <res> pixels, to speed things up;
    // i.e. every 2nd pixel in the search area is searched if <res> is 2.
    ant.lookFor = function(color, dist, res) {

      res = res || 4;

      var ax = ~~ant.x,
          ay = ~~ant.y,
          d = {
            N: 0,
            E: 0,
            S: 0,
            W: 0
          };

      for (var _x = ax - dist; _x <= ax + dist; _x += res) {
        for (var _y = ay - dist; _y <= ay + dist; _y += res) {
console.log(_x, _y)
          if        (Math.abs(ax - _x) >= Math.abs(ay - _y)) { // E
            d.E += field[color](_x, _y);
          } else if (Math.abs(ax - _x) <= -Math.abs(ay - _y)) { // W
            d.W += field[color](_x, _y);
          } else if (Math.abs(ay - _y) >= Math.abs(ax - _x)) { // N
            d.N += field[color](_x, _y);
          } else if (Math.abs(ay - _y) <= -Math.abs(ax - _x)) { // S
            d.S += field[color](_x, _y);
          } 

        }
      }

      // ugh, fix this crap
      if      (d.N > d.E && d.N > d.S && d.N > d.W) return 0;
      else if (d.E > d.N && d.E > d.S && d.E > d.W) return 90;
      else if (d.S > d.N && d.S > d.E && d.S > d.W) return 180;
      else if (d.W > d.N && d.W > d.E && d.W > d.S) return 270;
      else if (d.N + d.E + d.S + d.W == 0) return 0;

    }


    // cleans up the ant
    ant.remove = function() {
      field.objects.splice(field.objects.indexOf(ant), 1);
      ant.el.remove();
    }


    // runs just after position()
    ant.appearance = function() {
      // set size
      ant.el.css('width',  ant.width+'px');
      ant.el.css('height', ant.height+'px');

      // update color
      $('.ant-'+ant.id).css('border-color', ant.color);
      $('.ant-'+ant.id+':hover').css('border-color', '#f33');
    }


    ant.teach = function(script) {
      var onRun  = false, 
          onBump = false;
      eval(script);
      ant.program = script;
      if (onRun)  ant.onRun  = onRun;
      if (onBump) ant.onBump = onBump;
    }


    ant.edit = function() {

      // if onRun's been overwritten, it's not represented in the .program string:
      //ant.program = ""+ant.onRun

      field.editor.setValue(ant.program);
      $('.modal-code').on('shown.bs.modal-code', function() {
        field.editor.refresh();
      });
      $('.modal-code').modal({show: true});
      $('.modal-code .btn-gist').off("click");
      $('.modal-code .btn-gist').click(function() { ant.save() });
      $('.modal-code .save').off("click");
      $('.modal-code .save').click(function() {
        ant.teach(field.editor.getValue());
        $('.modal-code').modal({show: false});
      });
      // teach ALL THE ANTS of the same color
      $('.modal-code .save-all').click(function() {
        field.objects.forEach(function(_ant) {
          if (ant.color == _ant.color) _ant.teach(field.editor.getValue());
          $('.modal-code').modal({show: false});
        });
      });
    }


    ant.save = function() {
      var data = {
        "description": "An ant script saved from https://github.com/jywarren/antfarm",
        "public": true,
        "files": {
          "ant.js": {
            "content": field.editor.getValue()
          }
        }
      }
      $.ajax({
        url: 'https://api.github.com/gists',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(data)
      })
      .success( function(e) {
        window.open(e.html_url);
      })
      .error( function(e) {
        console.warn("gist save error", e);
      });
    }
    

    ant.el.on('dblclick', ant.edit);

    field.el.on("mousemove touchmove", function(e) {
      if (ant.dragging) {
        e.preventDefault();
        if (e.changedTouches) { // if it's a touch event
          e = e.changedTouches[0]; // reference first finger touch
        }
        ant.x = e.pageX-field.margin;
        ant.y = e.pageY-field.margin;
        ant.position();
      }
    });

    ant.el.on("mousedown touchstart", function (e) {
      ant.dragging = true;
    });

    ant.el.on("mouseup touchend", function (e) {
      ant.dragging = false;
    });

    ant.teach(ant.program);

    ant.run = function() {

      ant.age += 1;
      ant.energy -= 1;
      if (ant.onRun) ant.onRun();
      if (ant.onBump && ant.bump) ant.onBump();
 
    }

  }

});
