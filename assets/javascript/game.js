$(document).ready(function () {
  var clickingGame = {
    availableChars: [{
        name: "Bohruz",
        health: 42,
        attackVal: 1,
        cntrAtkVal: 2,
        imgSRC: "assets/images/Orc.png"
      },

      {
        name: "Emin",
        health: 17,
        attackVal: 5,
        cntrAtkVal: 2,
        imgSRC: "assets/images/Markham_Southwell.png"
      },

      {
        name: "Rudd",
        health: 20,
        attackVal: 3,
        cntrAtkVal: 2,
        imgSRC: "assets/images/Firbolg.png"
      },

      {
        name: "Sid",
        health: 25,
        attackVal: 2,
        cntrAtkVal: 2,
        imgSRC: "assets/images/Aasimar.png"
      }
    ],

    environments: [{
        name: "mountain-foot",
        imgSRC: "assets/images/landscape-891597_1280.jpg",
        type: "m",
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
      health: 5,
      cntrAtkVal: 1,
      imgSRC: "assets/images/Hobgoblin1.png",
      dead: false
    }, 

    {
      name: "kenku",
      health: 2,
      cntrAtkVal: 2,
      imgSRC: "assets/images/Kenku.png",
      dead: false
    }
    ],

    playerChar: {},

    writeStats: function(oneChar, isPlayer) {
      var valuesString
      if(isPlayer) {
        valuesString = "<p>Name: " + oneChar.name + "</p>" +
        "<p>Health: " + oneChar.health + "</p>" +
        "<p>Attack: " + oneChar.attackVal + "</p>";
      } else {
        valuesString = "<p>Health: " + oneChar.health + "</p>";
      }
      return valuesString;
    },

    drawChars: function(charList, areaName , size, playerSelection, placement) {
      var resultCont = $("<div>").addClass(placement + " row");
      $.each(charList, function(index){
        var container = $("<div>");
        container.addClass("img-container col-md-3 border rounded");
        var characters = $("<img>");
        characters.addClass(areaName + " center-block border rounded");
        characters.attr({"name": charList[index].name ,"index": index,"src": charList[index].imgSRC, "height": size, "width": "auto"});
        container.append(characters);
        var text = $("<div>");
        if (playerSelection) {
          text.addClass( charList[index].name + " character-stats text-center border rounded");
          characters.after(text.html(clickingGame.writeStats(charList[index], playerSelection)));
        }
        resultCont.prepend(container);
      });
      return resultCont;
    },

    selectChar: function(selectedCharacter) {
      this.playerChar = selectedCharacter;
      console.log(this.playerChar);
    },

    getEnemies: function() {
      var number = Math.floor(Math.random() * 4);
      var index = Math.floor(Math.random() * this.enemies.length);
      var result = [];
      for (var i = 0; i <= number; i++){
        //this.enemies[index].name += i;
        result.push($.extend({}, this.enemies[index]));
      }
      return result;
    },

    drawEnviro: function(enc) {
      $(".enemies-row").empty();
      enc.currEnviro = clickingGame.selectEnviro(enc.currEnviro);
      $("body").css("background-image", 'url("' + enc.currEnviro.imgSRC + '")');
      enc.currEnemies = clickingGame.getEnemies();
      var opCont = clickingGame.drawChars(enc.currEnemies, "current-enemies", "125px", false, "enemies-row");
      $(".encounter").after(opCont);
      $(".nextEnviro").prop("disabled", true);
      return enc
    },

    selectEnviro: function (oldEnvironment) {
      var chosen = Math.floor(Math.random() * this.environments.length);
      var regex = new RegExp("-" + this.environments[chosen].type + "-");
      if (oldEnvironment === undefined) {
        return this.environments[chosen];
      } else if (regex.test(oldEnvironment.validConnects)) {
        return this.environments[chosen];
      } else {
        for (var i = 0; i < this.environments.length; i++) {
          regex = new RegExp("-" + this.environments[i].type + "-");
          if (regex.test(oldEnvironment.validConnects)) {
            return this.environments[i];
          }
        }
      }
    },

    fight: function(attacker, target) {
      target.health -=attacker.attackVal;
      attacker.health -= target.cntrAtkVal;
    },

    doYouLose: function() {
      if (this.playerChar.health <= 0) {
        $(".gameSpace").empty();
        var end = $("<h1>").addClass("col-md-12").text("You have lost! Refresh to try again.");
        end.css("color", "red");
        $("body").css("background-image", "url(assets/images/cemetery-2650712_1920.jpg)");
        $(".gameSpace").append(end);
      }
    }

  } 

  var encounter = {
    currEnviro: undefined,
    currEnemies: [],
    selected: false
  };

  var charSelect = clickingGame.drawChars(clickingGame.availableChars, "available-Chars", "250px", true, "select-row");
  $(".selection").append(charSelect);

  $(".selection").on("click",".img-container" , function () {
    $(".img-container").appendTo(".discard");
    $(this).find(".available-Chars").removeClass("available-Chars").addClass("selected-Char");
    $(this).removeClass("col-md-3").addClass("col-md-4").appendTo(".player");
    $(".discard").hide();
    $(".selection").hide();
    clickingGame.selectChar(clickingGame.availableChars[$(this).find("img").attr("index")]);
    var btnCont = $("<div>").addClass("row");
    var btn = $("<button>Continue</button>");
    btn.addClass("nextEnviro center-block");
    btnCont.append(btn);
    btnCont.appendTo(".environment");
    clickingGame.drawEnviro(encounter);
  });

  $(".environment").on("click",".nextEnviro" , function() {
    clickingGame.drawEnviro(encounter);
  });

  $(".environment").on("click", ".current-enemies", function(){
    if (!encounter.selected) {
      $(".encounter").html("<h1>Current Target</h1>")
      $(".encounter").html(clickingGame.drawChars([encounter.currEnemies[$(this).attr("index")]], "selected-enemy", "125px", false, "enemy-row"));
      var text = $("<div>");
      text.addClass("character-stats text-center border rounded");
      $(".selected-enemy").after(text.html(clickingGame.writeStats(encounter.currEnemies[$(this).attr("index")], false)));
      $(this).remove();
      encounter.selected = true;
      var atkBtn = $("<button>Attack</button>").addClass("atkButton center-block").attr("index", $(this).attr("index"));
      $(".enemy-row").after(atkBtn);
    }
  });
  
  $(".encounter").on("click", ".atkButton", function(){
    var numDead = 0;
    for (var i = 0; i <encounter.currEnemies.length; i++) {
      if (encounter.currEnemies[i].dead === true) {
        numDead++;
      }
    }
    clickingGame.fight(clickingGame.playerChar, encounter.currEnemies[$(this).attr("index")])
    if (encounter.currEnemies[$(this).attr("index")].health <= 0) {
      encounter.currEnemies[$(this).attr("index")].dead = true;
      $(".encounter").empty();
      numDead++
      if (numDead === encounter.currEnemies.length){
        $(".nextEnviro").prop("disabled", false);
      }
      encounter.selected = false;
    }
    console.log(clickingGame.playerChar);
    $(".player .character-stats").html(clickingGame.writeStats(clickingGame.playerChar, true));
    $(".encounter .character-stats").html(clickingGame.writeStats(encounter.currEnemies[$(this).attr("index")], false));
    clickingGame.doYouLose();
  });
});