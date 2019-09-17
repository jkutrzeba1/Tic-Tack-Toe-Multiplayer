
var GameState = require("../game/gamestate.js");

function Lobby(io) {

  this.queue = []; // Socket ARRAY
  this.active_games = []; // GameState ARRAY

  io.on("connection", (socket)=>{
    console.log("Socket connected");


    socket.on("disconnect", ()=>{
      console.log("Socket disconnected");
    })

    socket.on("search_opponent", (player_name, fn)=>{

      console.log(player_name + " looking for opponent");

      socket.playername = player_name;

      this.queue.push(socket);

      if(this.queue.length == 2){

        console.log(this.queue[0].playername + " vs " + this.queue[1].playername );

        var new_game = new GameState();
        new_game.queue = this.queue.slice();

        this.queue = [];

        this.active_games.push(new_game);

        new_game.queue[0].opponent = new_game.queue[1];
        new_game.queue[1].opponent = new_game.queue[0];

        new_game.queue[0].emit("game_start", new_game.queue[1].playername);
        new_game.queue[1].emit("game_start", new_game.queue[0].playername);

        new_game.queue[0].current_game = new_game;
        new_game.queue[1].current_game = new_game;

        new_game.queue[0].mark = "x";
        new_game.queue[1].mark = "o";

        fn("o");

      }
      else{
        fn("x");
      }
    })

    socket.on("field_check", (row, col)=>{

      if(!socket.current_game){
        return;
      }

      var res = socket.current_game.handleFieldCheck(row,col, socket.mark);
      if(!res)
        return;
      
      socket.opponent.emit("field_checked", row, col);

      var winner = socket.current_game.checkEndOfGame();
      if(winner){
          //TODO: Handle end of game condition
      }

    })

  }) // SOCKET CONNECTION



}

module.exports = Lobby;
