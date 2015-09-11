AntFarm.Ant = Class.extend({

// tweak indents to look right in editor:
  program: { 

onRun: function() {

  this.direction += Math.random()*10-5;
  field.darken(this.x,this.y,'red',100); // x, y, rgb, amount

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

      // move with trigonometry
      ant.x = ant.x + Math.sin(ant.direction/180*Math.PI)*ant.speed;
      ant.y = ant.y + Math.cos(ant.direction/180*Math.PI)*ant.speed;
 
      // set position
      ant.el.css('left', ant.x-(ant.width/2)+'px');
      ant.el.css('top',  ant.y-(ant.height/2)+'px');

      // rotation
      // webkit, e.g. chrome/safari
      ant.el.css({ WebkitTransform: 'rotate(' + -ant.direction + 'deg)'});
      // For Mozilla browser: e.g. Firefox
      ant.el.css({ '-moz-transform': 'rotate(' + -ant.direction + 'deg)'});

      return ant;

    }

    // runs just after position()
    ant.appearance = function() {
      // set size
      ant.el.css('width',  ant.width+'px');
      ant.el.css('height', ant.height+'px');

      // update color
      $('ant-'+ant.id+':link').css('border-color', ant.color);
    }

    ant.teach = function(script) {
      eval("ant.program = " + script);
      ant.el.attr('script', script);
      Object.keys(ant.program).forEach(function(key) {
        ant[key] = ant.program[key];
      });
    }

    ant.edit = function() {
      $('textarea.script').val(ant.stringify(ant.program));
      $('.modal').modal({show: true});
      $('.modal .save').off("click");
      $('.modal .save').click(function() {
        ant.teach($('textarea.script').val());
        $('.modal').modal({show: false});
      });
      // teach ALL THE ANTS
      $('.modal .save-all').click(function() {
        field.objects.forEach(function(ant) {
          ant.teach($('textarea.script').val());
          $('.modal').modal({show: false});
        });
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

    ant.teach(ant.stringify(ant.program));

    ant.run = function() {
 
      if (ant.onRun) ant.onRun();
      if (ant.onBump && ant.bump) ant.onBump();
 
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
