jsPsych.plugins['boxes'] = (function(){

  var plugin = {};

  plugin.info = {
    name: 'boxes',
    parameters: {
      filled_in_reference: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: undefined
      },
      both_new: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: undefined
      },
      clearboth: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: undefined
      },
      dialog: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: null
      },
    }
  }

  plugin.trial = function(display_element, trial){

    var css_content = "<style>"
        css_content+= "html, body { background-color: black; }";
        css_content+= ".boxes-big-container { height: 600px; width: 960px; position: relative; overflow: hidden; background-color: black; border-top: #012BFF 6px solid; border-left: #012BFF 6px solid; border-right: 6px solid #F49661; border-bottom: 6px solid #F49661; }"
        css_content+= ".boxes-big-container:before { content: ''; position: absolute; pointer-events: none; z-index: 1; top: 0; left: 0; right: 0; bottom: 0; border-top: #F49661 6px solid; border-left: #F49661 6px solid; border-right: 6px solid #012BFF; border-bottom: 6px solid #012BFF; }"
        css_content+= "@keyframes change_color {0% { transform: translateY(0px); } 100% {transform: translateY(500px); }} "
        css_content+= ".start_animation {animation: change_color .5s;}"
        css_content+= "@keyframes intro {0% {transform: translateY(-1000px); } 100% { transform:translateY(0px); }}"
        css_content+= ".start_intro_animation {animation: intro .5s;}"
        css_content+= ".around_boxes { position: relative; width:800px; height:350px; top: calc(50% - 175px); left: calc(50% - 400px); } "
        css_content+= ".keybox { position: absolute; top: 500px;  width: 60px; height: 60px;  margin: 0; text-align:center; }"
        css_content+= ".keybox p { font-family: 'Overpass'; font-weight: bold; line-height: 70px; margin: 0; padding: 0; font-size: 45px; color:white; }"
        css_content+= "#Y { left: calc(50% - 70px); background-color: #F49661; }"
        css_content+= "#N { left: calc(50% + 10px); background-color: #012BFF; }"
        css_content+= "#inside_box_1 { position:absolute; width:350px; height:350px; left: 0px;  }"
        css_content+= "#inside_box_2 { position:absolute; width:350px; height:350px; right: 0px; } "
        css_content+= ".square:after { content: ''; position:absolute; height:"+Math.round(trial.square_size/3)+"px; width:"+(trial.square_size - trial.square_size*0.1)+"px; top:100%; background-color: #012BFF; left:0px; transform: skewX(45deg); transform-origin: 0 0;}"
        css_content+= ".square:before { content: ''; position:absolute; height:"+(trial.square_size - trial.square_size*0.1)+"px; width:"+Math.round(trial.square_size/3)+"px; left:100%; background-color: #F49661; transform: skewY(45deg); transform-origin: 0 0;}"
        if(trial.rotation_target < 90){
          for(var i=0; i<trial.grid_rows; i++){
            css_content += "#inside_box_2 .row-"+i+" { z-index: "+i+" }"
          }
        } else if(trial.rotation_target >= 90 && trial.rotation_target < 180){
          css_content+= "#inside_box_2 .square { transform: rotate(-90deg); }"
          var z = 1;
          for(var i=trial.grid_rows-1; i>=0; i--){
            css_content += "#inside_box_2 .row-"+i+" { z-index: "+z+" }"
            z++;
          }
        } else if( trial.rotation_target >= 180){
          css_content+= "#inside_box_2 .square { transform: rotate(-180deg); }"
          var z = 1;
          for(var i=trial.grid_rows-1; i>=0; i--){
            for(var j=trial.grid_cols-1; j>=0; j--){
              css_content += "#inside_box_2 .row-"+i+".col-"+j+" { z-index: "+z+" }"
              z++;
            }
          }
        }
        css_content+= "</style>"

    var html_content = "<div class='boxes-big-container'>"
        html_content +="<div class='around_boxes'>"
        html_content+= "<div id='inside_box_1'> </div>"
        html_content+= "<div id='inside_box_2'> </div>"
        html_content += "</div>"
        html_content += "<div class='keybox' id='Y'><p>Y</p></div><div class='keybox' id='N'><p>N</p></div>"
        html_content += "</div>"
        if(trial.dialog!==null){
          html_content+= "<div class= 'dialog'><div id='dialog_text'> "+trial.dialog[0]+"</div>"
          html_content+= "<button id= 'dialog_button'>Continue</button>"
          html_content+= "</div>"
        }
    display_element.innerHTML = css_content + html_content;

    var grid_cols= trial.grid_cols;
    var grid_rows= trial.grid_rows;
    var square_size = trial.square_size;
    var rotation_reference= trial.rotation_reference;
    var rotation_target= trial.rotation_target;
    var filled_in_reference= trial.filled_in_reference;
    var filled_in_target = trial.reflected? plugin.reflectShape(trial.filled_in_reference): trial.filled_in_reference;
    var html= createSquares(grid_cols, grid_rows, square_size, rotation_reference, filled_in_reference, trial.square_size*0.1);
    var html_2= createSquares(grid_cols, grid_rows, square_size, rotation_target, filled_in_target, trial.square_size*0.1);

    document.querySelector('#inside_box_1').innerHTML= html;
    document.querySelector('#inside_box_2').innerHTML= html_2;

    var current_page= 0

    var both_new = trial.both_new;
    var correct_match = trial.correct_match;

    var lAudio = new Audio ('Wrong.mp3');
    var wAudio = new Audio ('Correct.mp3');

    if(both_new){
       document.querySelector('#inside_box_1').className = "start_intro_animation";
       document.querySelector('#inside_box_2').className = "start_intro_animation";
      // animate both boxes coming from the top of the screen
    } else {
      document.querySelector('#inside_box_2').className = "start_intro_animation";
      // animate only the right box coming from the top of the screen
    }
    var correct = null;

    if(trial.dialog!== null){

    document.querySelector('#dialog_button').addEventListener("click",function(){
      if(trial.dialog.length==current_page + 1){
      document.querySelector('.dialog').remove()
      addKeyListener()
    } else {
      current_page++
      document.querySelector('#dialog_text').innerHTML=trial.dialog[current_page]
    }
    })
  } else {
    addKeyListener()
  }
    function addKeyListener(){
      document.addEventListener("keydown", function(e){

        if (e.keyCode==78){
          document.querySelector('#inside_box_2').addEventListener("animationend", function(){
            display_element.innerHTML = "";
            end();
          })
          document.querySelector('#inside_box_2').className = "start_animation";

          if(correct_match == 'n'){

            document.querySelector('#inside_box_2').insertAdjacentHTML("afterend", '<img src="check.png" style="width:12%; display:block; margin: auto; ">');
            wAudio.play();
            correct = true;
            if(trial.clearboth){
              document.querySelector('#inside_box_1').className = "start_animation";
            }
          }
          if (correct_match == 'y'){

            document.querySelector('#inside_box_2').insertAdjacentHTML("afterend", '<img src="x.png" style="width:12%; display:block; margin: auto; ">');
            lAudio.play();
            correct = false;
          }
        } else if( e.keyCode == 89){
          document.querySelector('#inside_box_2').addEventListener("animationend", function(){
            display_element.innerHTML = "";
            end();
          })
          document.querySelector('#inside_box_2').className = "start_animation";

          if(correct_match == 'y'){
            document.querySelector('#inside_box_2').insertAdjacentHTML("afterend", '<img src="check.png" style="width:12%; display:block; margin: auto; ">');
            wAudio.play();
            correct = true;
            if(trial.clearboth){
              document.querySelector('#inside_box_1').className = "start_animation";
            }
          }
          if(correct_match == 'n'){

            document.querySelector('#inside_box_2').insertAdjacentHTML("afterend", '<img src="x.png" style="width:12%; display:block; margin: auto; ">');
            lAudio.play();
            correct = false;
          }
        }
      }, {once:true});

    }


    function end(){
      jsPsych.finishTrial({
        correct: correct
      })
    }
  }

  function createSquares(grid_cols, grid_rows, square_size, rotation, filled_in, padding) {
    var grid_width = square_size * grid_cols;
    var grid_height = square_size * grid_rows;

    var html= "<div style='width:"+grid_width+"px; height:"+grid_height+"px; left:calc(50% - "+(grid_width/2)+"px); top:calc(50% - "+(grid_height/2)+"px);  position:relative; transform:rotate("+rotation+"deg);'>"
    for(row=0; row < grid_rows; row++){
      for(col=0; col < grid_cols; col++){
        if(filled_in[row][col] == true){
          html+= "<div class='square row-"+row+" col-"+col+"' style='position:absolute; left:"+(col*square_size)+"px; top:"+(row*square_size)+"px; width:"+(square_size-padding)+"px; height:"+(square_size-padding)+"px; background-color: white;'></div>"
        }
      }
    }
        html += "</div>"
    return html;
  }

  plugin.generateShape=function(nrows, ncols, fill){

      var grid = [];
      // create an array with rows*cols values, and fill of them are true.
      var total_spots = nrows * ncols;
      for(i=0; i < nrows; i++){
        grid[i]=[];
        for(j=0; j< ncols; j++){
          grid[i][j]= false;
        }
      }
      // pick a random starting location
      var row = Math.floor(Math.random()*nrows);
      var col = Math.floor(Math.random()*ncols);
      grid[row][col]= true;

      for(var i=1; i<fill; i++){
        while(grid[row][col] == true){
          if (Math.floor(Math.random()*2) == 0) {
             if (Math.floor(Math.random()*2) == 0){
               if(row<nrows-1){
                 row++;
               }
             }
             else {
               if(row>0){
                 row--
               }
             }
          } else {
            if (Math.floor(Math.random()*2) == 0){
              if(col<ncols-1){
                col++
              }
            }
            else {
              if(col>0){
                col--
              }
            }
          }
        }
        grid[row][col] = true;
      }
      return grid;
  }

  plugin.generateFullShape=function(nrows, ncols, fill){

    var shape= plugin.generateShape(nrows, ncols, fill);
     while(check_full(shape)== false ||
     JSON.stringify(plugin.rotateShape90(shape))== JSON.stringify(shape) ||
     JSON.stringify(plugin.rotateShape180(shape))== JSON.stringify(shape) ||
     JSON.stringify(plugin.rotateShape270(shape))== JSON.stringify(shape) ||
     JSON.stringify(plugin.rotateShape90(plugin.reflectShape(shape)))== JSON.stringify(shape) ||
     JSON.stringify(plugin.rotateShape180(plugin.reflectShape(shape)))== JSON.stringify(shape) ||
     JSON.stringify(plugin.rotateShape270(plugin.reflectShape(shape)))== JSON.stringify(shape))

     {
       shape = plugin.generateShape(nrows, ncols, fill);
     }

     return shape
  };

  function check_full(shape){
    var low= null;
    var high= null;
    var nrows= shape.length;
    var ncols= shape[0].length;
    var row = 0;
    var bad_shape = true;
    for(i=0; i < ncols; i++){
      if(shape[row][i]){
        bad_shape = false;
      }
    }
    if(bad_shape){
      return false
    }

    var row = nrows - 1;
    var bad_shape = true;
    for(i=0; i < ncols; i++){
      if(shape[row][i]){
        bad_shape = false;
      }
    }
    if(bad_shape){
      return false;
    }

    var col = 0;
    var bad_shape = true;
    for(i=0; i < nrows; i++){
      if(shape[i][col]){
        bad_shape = false;
      }
    }
    if(bad_shape){
      return false;
    }

    var col = ncols - 1;
    var bad_shape = true;
    for(i=0; i < nrows; i++){
      if(shape[i][col]){
        bad_shape = false;
      }
    }
    if(bad_shape){
      return false;
    }

    return true;
  }

  plugin.rotateShape180=function(shape){

    var nrows= shape.length;
    var ncols= shape[0].length;
    var max_rows= shape.length - 1;
    var max_cols= shape[0].length - 1;

    var grid= [];

    for(i=0; i < nrows; i++){
      grid[i]=[]
      for(j=0; j< ncols; j++){
        grid[i][j]= false
      }
    }
    for(i=0; i < nrows; i++){
      for(j=0; j< ncols; j++){
        var new_col= max_cols - j;
        var new_row= max_rows - i;
        grid[new_row][new_col]= shape[i][j];
      }
    }
    return grid;
  }

  plugin.rotateShape90=function(shape){

    var nrows= shape.length;
    var ncols= shape[0].length;
    var max_rows= shape.length - 1;
    var max_cols= shape[0].length - 1;

    var grid= [];

    for(i=0; i < nrows; i++){
      grid[i]=[]
      for(j=0; j< ncols; j++){
        grid[i][j]= false
      }
    }
    for(i=0; i < nrows; i++){
      for(j=0; j< ncols; j++){
        var new_col= max_rows - i
        var new_row= j;
        grid[new_row][new_col]= shape[i][j];
      }
    }
    return grid;
  }

  plugin.rotateShape270=function(shape){

    var nrows= shape.length;
    var ncols= shape[0].length;
    var max_rows= shape.length - 1;
    var max_cols= shape[0].length - 1;

    var grid= [];

    for(i=0; i < nrows; i++){
      grid[i]=[]
      for(j=0; j< ncols; j++){
        grid[i][j]= false
      }
    }
    for(i=0; i < nrows; i++){
      for(j=0; j< ncols; j++){
        var new_col= i
        var new_row= max_cols - j;
        grid[new_row][new_col]= shape[i][j];
      }
    }
    return grid;
  }

  plugin.reflectShape=function(shape){
    var low= null;
    var high= null;
    var nrows= shape.length;
    var ncols= shape[0].length;
    for(i=0; i < ncols; i++){
      for(j=0; j< nrows; j++){
        if(shape[j][i]== true){
          if(low === null){
            low = i;
          }
          high = i
        }
      }
    }
    var midpoint= (high-low)/2 + low

    var grid= [];

    for(i=0; i < nrows; i++){
      grid[i]=[]
      for(j=0; j< ncols; j++){
        grid[i][j]= false
      }
    }
    for(i=0; i < nrows; i++){
      for(j=0; j< ncols; j++){
        if(shape[i][j]==true) {
        grid[i][(midpoint-j) + midpoint]= true
        }
      }
    }
    return grid;
  }
  return plugin;
  }) ();
