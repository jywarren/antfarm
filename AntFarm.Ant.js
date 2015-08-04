AntFarm.Ant = Class.extend({

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
    this.position = function() {
      this.bump = false;

      // limit to bounds
      if (ant.x > field.width) { 
        this.bump = true;
        ant.x = field.width;
      }
      if (ant.y > field.height) {
        this.bump = true;
        ant.y = field.height;
      }
      if (ant.x < 0) {
        this.bump = true;
        ant.x = 0;
      }
      if (ant.y < 0) {
        this.bump = true;
        ant.y = 0;
      }

      // move with trigonometry
      ant.x = ant.x + Math.sin(ant.direction/180*Math.PI)*ant.speed;
      ant.y = ant.y + Math.cos(ant.direction/180*Math.PI)*ant.speed;
 
      // set position
      ant.el.css('left',ant.x-(ant.width/2)+'px');
      ant.el.css('top', ant.y-(ant.height/2)+'px');

      // rotation
      // webkit, e.g. chrome/safari
      ant.el.css({ WebkitTransform: 'rotate(' + -ant.direction + 'deg)'});
      // For Mozilla browser: e.g. Firefox
      ant.el.css({ '-moz-transform': 'rotate(' + -ant.direction + 'deg)'});
    }

    // runs just after position()
    this.appearance = function() {
      // set size
      ant.el.css('width',  ant.width+'px');
      ant.el.css('height', ant.height+'px');

      // update color
      ant.el.css('border-color',ant.color);
    }

    this.teach = function(script) {
      ant.el.attr('script', script);
      eval("ant.run = "+script);
    }

    this.edit = function() {
      $('textarea.script').val(ant.run+''); // coerce to string
      $('.modal').modal({show: true});
      $('.modal .save').click(function() {
        ant.teach($('textarea.script').val());
        $('.modal').modal({show: false});
      });
    }
    this.el.on('dblclick', ant.edit);

    field.el.on("mousemove", function(e) {
        if (ant.dragging) {
          ant.x = e.pageX-field.margin;
          ant.y = e.pageY-field.margin;
          ant.position();
        }
    });

    this.el.on("mousedown", function (e) {
        ant.dragging = true;
    });

    this.el.on("mouseup", function (e) {
        ant.dragging = false;
    });

  },

  run: function() {

    this.direction += Math.random()*10-5;
    if (this.bump) this.direction += 90;
    field.darken(this.x,this.y,0,100);

  },

});
