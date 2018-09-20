$(document).ready(function () {
  var clickingGame = {
    availableChars: [{
        name: "Bohruz",
        health: 26,
        attackVal: 1,
        baseAtk: 1,
        imgSRC: "assets/images/Orc.png"
      },

      {
        name: "Emin",
        health: 19,
        attackVal: 1,
        baseAtk: 1,
        imgSRC: "assets/images/Markham_Southwell.png"
      },

      {
        name: "Rudd",
        health: 15,
        attackVal: 4,
        baseAtk: 4,
        imgSRC: "assets/images/Firbolg.png"
      },

      {
        name: "Sid",
        health: 22,
        attackVal: 2,
        baseAtk: 2,
        imgSRC: "assets/images/Aasimar.png"
      }
    ],

    environments: [{
        name: "mountain-foot",
        imgSRC: "assets/images/landscape-891597_1280.jpg",
        type: "mf",
        validConnects: "-mf-t-s-f-d-"
      },

      {
        name: "mountains",
        imgSRC: "assets/images/zion-park-139012_1280.jpg",
        type: "m",
        validConnects: "-mf-"
      },

      {
        name: "desert",
        imgSRC: "assets/images/arid-1850193_1280.jpg",
        type: "d",
        validConnects: "-t-d-mf-r-"
      },

      {
        name: "snowy-plains",
        imgSRC: "assets/images/wintry-2068298_1280.jpg",
        type: "s",
        validConnects: "-t-mf-r-s-"
      },

      {
        name: "temperate-plains",
        imgSRC: "assets/images/landscape-690345_1280.jpg",
        type: "t",
        validConnects: "-mf-t-d-r-f-s-"
      },

      {
        name: "river",
        imgSRC: "assets/images/yellowstone-national-park-1589616_1280.jpg",
        type: "r",
        validConnects: "-t-d-r-s-"
      },

    ],

    enemies: [{
      name:"goblin",
      health: 3,
      cntrAtkVal: 0,
      cntrAtkMax: 2,
      imgSRC: "assets/images/Hobgoblin1.png",
      dead: false
    }, 

    {
      name: "kenku",
      health: 2,
      cntrAtkVal: 0,
      cntrAtkMax: 3,
      imgSRC: "assets/images/Kenku.png",
      dead: false
    }
    ],

    playerChar: {},

    //configures stats for character objects to be written to screen
    writeStats: function(oneChar, isPlayer) {
      var valuesString
      if(isPlayer) {
        valuesString = "<p>Name: " + oneChar.name + "</p>" +
        "<p>Health: " + oneChar.health + "</p>" +
        "<p>Attack: " + oneChar.attackVal + "</p>";
      } else {
        valuesString = "<p>Health: " + oneChar.health + "</p>" +
        "<p>Counter Attack: "+ oneChar.cntrAtkVal + "</p>";
      }
      return valuesString;
    },

    //places images of characters to screen and writes out current status; takes a list of character objects, a class name for the image to be able to grabbed later, a size for the images to display at, whether it is the player, and another class name for the row i is being palce in
    drawChars: function(charList, areaName , size, playerSelection, placement) {
      var resultCont = $("<div>").addClass(placement + " row");
      //iterates through list of character objecs provided
      $.each(charList, function(index){
        var container = $("<div>");
        container.addClass("img-container col-md-3 border rounded");
        var characters = $("<img>");
        characters.addClass(areaName + " center-block border rounded");
        characters.attr({"name": charList[index].name ,"index": index,"src": charList[index].imgSRC, "height": size, "width": "auto"});
        container.append(characters);
        var text = $("<div>");
        text.addClass( charList[index].name + " character-stats text-center border rounded");
        characters.after(text.html(clickingGame.writeStats(charList[index], playerSelection)));
        resultCont.prepend(container);
      });
      return resultCont;
    },

    selectChar: function(selectedCharacter) {
      this.playerChar = selectedCharacter;
    },

    //grabs a random number of enemies and returns copies of the template enemy object
    getEnemies: function(enc) {
      console.log()
      var number = Math.floor(Math.random() * 3) + 1;
      var result = [];
      for (var i = 0; i <= number; i++){
        var index = Math.floor(Math.random() * this.enemies.length);
        result.push($.extend({}, this.enemies[index]));
        result[i].cntrAtkVal = Math.floor(Math.random() * this.enemies[index].cntrAtkMax);
        result[i].health *= enc.encountersPassed + 1; 
      }
      return result;
    },
    
    //draws the environment image from the current environment to the screen
    drawEnviro: function(enc) {
      $(".enemies-row").empty();
      enc.currEnviro = clickingGame.selectEnviro(enc.currEnviro);
      $("body").css("background-image", 'url("' + enc.currEnviro.imgSRC + '")');
      enc.currEnemies = clickingGame.getEnemies(enc);
      var opCont = clickingGame.drawChars(enc.currEnemies, "current-enemies", "125px", false, "enemies-row").addClass("col-md-12");
      $(".encounter").after(opCont);
      return enc
    },

    //gets a new environment.
    selectEnviro: function (oldEnvironment) {
      var chosen = Math.floor(Math.random() * this.environments.length);
      var regex = new RegExp("-" + this.environments[chosen].type + "-");
      //checks if the environment has been set at least once, otherwise it checks if the environment can be connected to the previous environment, otherwise it iterates through the environments until it finds a valid connection
      if (oldEnvironment === undefined) {
        return this.environments[chosen];
      } else if (regex.test(oldEnvironment.validConnects)) {
        return this.environments[chosen];
      } else {
        for (var i = 0; i < this.environments.length; i++) {
          regex = new RegExp("-" + this.environments[i].type + "-");
          if (regex.test(oldEnvironment.validConnects)) {
            return this.environments[i];
          } else if (i === this.environments.length - 1){
            i = 0;
          }
        }
      }
    },

    //decrements the health values for both an attacker object and a target object
    fight: function(attacker, target) {
      if (attacker.attackVal <= (target.health * 2)){
        attacker.health -= target.cntrAtkVal;
      }
      target.health -=attacker.attackVal
      attacker.attackVal += attacker.baseAtk;
    },

    //checks to see if the player has lost
    winOrLose: function(enc) {
      if (this.playerChar.health <= 0 && enc.encountersPassed < 4) {
        $(".gameSpace").empty();
        var end = $("<h1>").addClass("col-md-12").text("You have lost! Refresh to try again.");
        end.css("color", "red");
        $("body").css("background-image", "url(assets/images/cemetery-2650712_1920.jpg)");
        $(".gameSpace").append(end);
      } else if (this.playerChar.health > 0 && enc.encountersPassed >= 4){
        $(".gameSpace").empty();
        var end = $("<h1>").addClass("col-md-12").text("Congrtulations! You win!");
        end.css("color", "green");
        $("body").css("background-image", "url(assets/images/success-846055_1920.jpg)");
        $(".gameSpace").append(end);
      }
    }

  } 

  //sets up the encounter
  var encounter = {
    currEnviro: undefined,
    currEnemies: [],
    selected: false,
    encountersPassed: 0
  };

  //draws the available character to the screen
  var charSelect = clickingGame.drawChars(clickingGame.availableChars, "available-Chars", "250px", true, "select-row");
  $(".selection").append(charSelect);

  //detects if the player has selected a character and initializes the gamespace
  $(".selection").on("click",".img-container" , function () {
    //moves the selected character and hides the unselected characters
    $(".img-container").appendTo(".discard");
    $(this).find(".available-Chars").removeClass("available-Chars").addClass("selected-Char");
    $(this).removeClass("col-md-3").addClass("col-md-4").appendTo(".player");
    $(".discard").hide();
    $(".selection").hide();
    clickingGame.selectChar(clickingGame.availableChars[$(this).find("img").attr("index")]);
    clickingGame.drawEnviro(encounter);
  });

  //gets the next environment
  $(".environment").on("click",".nextEnviro" , function() {
    $(".enemies-row").remove();
    $(this).remove();
    encounter.encountersPassed++;
    clickingGame.drawEnviro(encounter);
    clickingGame.winOrLose(encounter);
  });

  //detects if the player has selected an enemy to fight
  $(".environment").on("click", ".current-enemies", function(){
    if (!encounter.selected) {
      //removing the selected enemy from the environment and placing them in the encounter
      $(".encounter").html(clickingGame.drawChars([encounter.currEnemies[$(this).attr("index")]], "selected-enemy", "125px", false, "enemy-row"));
      $(".encounter").prepend("<h1>Current Target</h1>");
      $(this).parent().remove();
      //disallows a new enemyfrom being select
      encounter.selected = true;
      var atkBtn = $("<button>Attack</button>").addClass("atkButton center-block").attr("index", $(this).attr("index"));
      $(".enemy-row").after(atkBtn);
    }
  });
  
  //detects when the player is attacking
  $(".encounter").on("click", ".atkButton", function(){
    //checking how many of the enemies have been defeated
    var numDead = 0;
    for (var i = 0; i <encounter.currEnemies.length; i++) {
      if (encounter.currEnemies[i].dead === true) {
        numDead++;
      }
    }
    //this is where they fight
    clickingGame.fight(clickingGame.playerChar, encounter.currEnemies[$(this).attr("index")])
    //checks if the current enemy is dead
    if (encounter.currEnemies[$(this).attr("index")].health <= 0) {
      encounter.currEnemies[$(this).attr("index")].dead = true;
      $(".encounter").empty();
      numDead++
      //re-enables the environment button if all the enemies are dead
      if (numDead === encounter.currEnemies.length){
        //adds a button to continue the journey
        var btnCont = $("<div>").addClass("row");
        var btn = $("<button>Next Environment</button>");
        btn.addClass("nextEnviro center-block");
        btnCont.append(btn);
        btnCont.appendTo(".environment");
      }
      //reallows a new enemy to be selected to fight
      encounter.selected = false;
    }
    //updates the players status
    $(".player .character-stats").html(clickingGame.writeStats(clickingGame.playerChar, true));
    //updates the current enemy's stats
    $(".encounter .character-stats").html(clickingGame.writeStats(encounter.currEnemies[$(this).attr("index")], false));
    //checks if the player has lost or won the game
    clickingGame.winOrLose(encounter);
  });
});