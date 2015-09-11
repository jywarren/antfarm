AntFarm.Ant = Class.extend({

// tweak indents to look right in editor:
  program: { 

onRun: function() {

  this.direction += Math.random()*10-5;
  field.darken(this.x, this.y, 'blue', 50); // x, y, rgb, amount

},
 
onBump: function() {

  this.direction += 90;

}
 
  },

  init: function(field) {

    this.id = field.getId();
    $('.field').append('<div class="ant ant-'+this.id+'"></div>');
    this.el = $('.ant-'+id);
    this.x = parseInt(Math.random()*field.width);
    this.y = parseInt(Math.random()*field.height);
    this.width = 10;
    this.height = 10;
    this.speed = 1;
    this.direction = Math.random()*360;
    this.color = "red";

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

      // move with trigonometry
      _ant.x = _ant.x + Math.sin(_ant.direction/180*Math.PI)*_ant.speed;
      _ant.y = _ant.y + Math.cos(_ant.direction/180*Math.PI)*_ant.speed;
 
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

    // runs just after position()
    _ant.appearance = function() {
      // set size
      _ant.el.css('width',  _ant.width+'px');
      _ant.el.css('height', _ant.height+'px');

      // update color
      $('.ant-'+_ant.id).css('border-color', _ant.color);
    }

    _ant.teach = function(script) {
      eval("_ant.program = " + script);
      _ant.el.attr('script', script);
      Object.keys(_ant.program).forEach(function(key) {
        _ant[key] = _ant.program[key];
      });
    }

    _ant.edit = function() {
      $('textarea.script').val(_ant.stringify(_ant.program));
      $('.modal').modal({show: true});
      $('.modal .save').off("click");
      $('.modal .save').click(function() {
        _ant.teach($('textarea.script').val());
        $('.modal').modal({show: false});
      });
      // teach ALL THE ANTS
      $('.modal .save-all').click(function() {
        field.objects.forEach(function(_ant) {
          _ant.teach($('textarea.script').val());
          $('.modal').modal({show: false});
        });
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

    _ant.teach(_ant.stringify(_ant.program));

    _ant.run = function() {
 
      if (_ant.onRun) _ant.onRun();
      if (_ant.onBump && _ant.bump) _ant.onBump();
 
    }

  },

  stringify: function(obj) {

    var keys = Object.keys(obj),
        string = "{\n\n";

    keys.forEach(function(key) {
      string += key + ": " + obj[key] + ",\n\n";
    });

    string += "}";

    return string;

  }

});
