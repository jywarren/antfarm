AntFarm.Ant = Class.extend({

  intervals: [],

// tweak indents to look right in editor:
  program: "onRun = function() {\n\n  this.direction += Math.random()*10-5;\n  field.trail(this.x, this.y, 'blue', 255); // x, y, rgb, amount\n\n}\n\nonBump = function() {\n\n  this.direction += 90;\n\n}\n",

  init: function(field) {

    this.id = field.getId();
    $('.field').append('<div class="ant ant-'+this.id+'"></div>');
    this.el = $('.ant-'+id);
    this.x = parseInt(Math.random()*field.width);
    this.y = parseInt(Math.random()*field.height);
    this.age = 0;
    this.width = 10;
    this.height = 10;
    this.speed = 2;
    this.direction = Math.random()*360;
    this.color = "white";

    var _ant = this;

    // runs just after run()
    _ant.position = function() {
      _ant.bump = false;

      // limit to bounds
      if (_ant.x > field.width) { 
        _ant.bump = true;
        _ant.x = field.width;
      }
      if (_ant.y > field.height) {
        _ant.bump = true;
        _ant.y = field.height;
      }
      if (_ant.x < 0) {
        _ant.bump = true;
        _ant.x = 0;
      }
      if (_ant.y < 0) {
        _ant.bump = true;
        _ant.y = 0;
      }

      // move with trigonometry; set up to zero
      _ant.x += Math.sin((_ant.direction+180)/180*Math.PI) * _ant.speed;
      _ant.y += Math.cos((_ant.direction+180)/180*Math.PI) * _ant.speed;
 
      // set position
      _ant.el.css('left', _ant.x-(_ant.width/2)+'px');
      _ant.el.css('top',  _ant.y-(_ant.height/2)+'px');

      // rotation
      // webkit, e.g. chrome/safari
      _ant.el.css({ WebkitTransform: 'rotate(' + -_ant.direction + 'deg)'});
      // For Mozilla browser: e.g. Firefox
      _ant.el.css({ '-moz-transform': 'rotate(' + -_ant.direction + 'deg)'});

      return _ant;

    }


    // grows ant by pixels dimension
    _ant.grow = function(pixels) {
      _ant.height += pixels;
      _ant.width += pixels;
    }


    // runs <callback> every <seconds>
    var every = function(seconds, callback) {
      // this isn't right -- it should run only when the clock is running. 
      var interval = setInterval(callback, seconds * 1000);
      _ant.intervals.push(interval);
      return interval;
    }

    // look <distance> pixels in each direction 
    // (forming a square) for "red", "green" or "blue"
    // and returns "N", "E", "S", "W"
    var lookFor = function(color, distance) {

      var x1 = ~~_ant.x - distance,
          y1 = ~~_ant.y - distance,
          x2 = ~~_ant.x + distance,
          y2 = ~~_ant.y + distance,
          d = {
            N: 0,
            E: 0,
            S: 0,
            W: 0
          };

      for (var _x = x1; _x <= x2; _x++) {
        for (var _y = y1; _y <= y2; _y++) {

          if        (_x >= Math.abs(_y)) { // E
            d.E += field[color](_x, _y);
          } else if (_x <= -Math.abs(_y)) { // W
            d.W += field[color](_x, _y);
          } else if (_y >= Math.abs(_x)) { // N
            d.N += field[color](_x, _y);
          } else if (_y <= -Math.abs(_x)) { // S
            d.S += field[color](_x, _y);
          } 

        }
      }
console.log(JSON.stringify(d))
      // ugh
      if      (d.N > d.E && d.N > d.S && d.N > d.W) return "N";
      else if (d.E > d.N && d.E > d.S && d.E > d.W) return "E";
      else if (d.S > d.N && d.S > d.E && d.S > d.W) return "S";
      else if (d.W > d.N && d.W > d.E && d.W > d.S) return "W";
      else if (d.N + d.E + d.S + d.W == 0) return false;

    }


    // cleans up the ant
    _ant.remove = function() {
      field.objects.splice(field.objects.indexOf(_ant), 1);
      _ant.el.remove();
    }


    // runs just after position()
    _ant.appearance = function() {
      // set size
      _ant.el.css('width',  _ant.width+'px');
      _ant.el.css('height', _ant.height+'px');

      // update color
      $('.ant-'+_ant.id).css('border-color', _ant.color);
      $('.ant-'+_ant.id+':hover').css('border-color', '#f33');
    }


    _ant.teach = function(script) {
      var onRun  = false, 
          onBump = false;
      eval(script);
      _ant.program = script;
      if (onRun)  _ant.onRun  = onRun;
      if (onBump) _ant.onBump = onBump;
    }


    _ant.edit = function() {
      //$('textarea.script').val();
      field.editor.setValue(_ant.program);
      $('.modal').on('shown.bs.modal', function() {
        field.editor.refresh();
      });
      $('.modal').modal({show: true});
      $('.modal .btn-gist').off("click");
      $('.modal .btn-gist').click(function() { _ant.save() });
      $('.modal .save').off("click");
      $('.modal .save').click(function() {
        _ant.teach(field.editor.getValue());
        $('.modal').modal({show: false});
      });
      // teach ALL THE ANTS of the same color
      $('.modal .save-all').click(function() {
        field.objects.forEach(function(__ant) {
          if (_ant.color == __ant.color) __ant.teach(field.editor.getValue());
          $('.modal').modal({show: false});
        });
      });
    }


    _ant.save = function() {
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
    

    _ant.el.on('dblclick', _ant.edit);

    field.el.on("mousemove touchmove", function(e) {
      if (_ant.dragging) {
        e.preventDefault();
        if (e.changedTouches) { // if it's a touch event
          e = e.changedTouches[0]; // reference first finger touch
        }
        _ant.x = e.pageX-field.margin;
        _ant.y = e.pageY-field.margin;
        _ant.position();
      }
    });

    _ant.el.on("mousedown touchstart", function (e) {
      _ant.dragging = true;
    });

    _ant.el.on("mouseup touchend", function (e) {
      _ant.dragging = false;
    });

    _ant.teach(_ant.program);

    _ant.run = function() {

      _ant.age += 1;
      if (_ant.onRun) _ant.onRun();
      if (_ant.onBump && _ant.bump) _ant.onBump();
 
    }

  }

});
