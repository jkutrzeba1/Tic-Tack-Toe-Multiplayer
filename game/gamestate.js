
function GameState(){

  this.state = {
    fields: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    turn: "x",
    winner: null,
    queue: [] // [Socket,Socket]
  }

}

GameState.prototype.handleFieldCheck = function(row, col, mark){

  if(this.state.winner){
    return false;
  }

  if(mark != this.state.turn){
    return false;
  }

  var cur_field_state = this.state.fields[row][col];
  if(cur_field_state != null){
    console.log("ERROR: field already checked " + cur_field_state);
    return;
  }

  this.state.fields[row][col] = this.state.turn;

  if(this.state.turn == "x"){
    this.state.turn = "o"
  }
  else if(this.state.turn == "o"){
    this.state.turn = "x"
  }

  return true

}

GameState.prototype.checkEndOfGame = function(){

    var winner = null;

    if(this.state.fields[0][0] && this.state.fields[0][0] == this.state.fields[0][1] && this.state.fields[0][0] == this.state.fields[0][2]){
      winner = this.state.fields[0][0];
    }
    if(this.state.fields[1][0] && this.state.fields[1][0] == this.state.fields[1][1] && this.state.fields[1][0] == this.state.fields[1][2]){
     winner = this.state.fields[1][0];
    }
    if(this.state.fields[2][0] && this.state.fields[2][0] == this.state.fields[2][1] && this.state.fields[2][0] == this.state.fields[2][2]){
     winner = this.state.fields[2][0]
    }


    if(this.state.fields[0][0] && this.state.fields[0][0] == this.state.fields[1][0] && this.state.fields[0][0] == this.state.fields[2][0]){
     winner = this.state.fields[0][0]
    }
    if(this.state.fields[0][1] && this.state.fields[0][1] == this.state.fields[1][1] && this.state.fields[0][1] == this.state.fields[2][1]){
     winner = this.state.fields[0][1]
    }
    if(this.state.fields[0][2] && this.state.fields[0][2] == this.state.fields[1][2] && this.state.fields[0][2] == this.state.fields[2][2]){
     winner = this.state.fields[0][2]
    }

    if(this.state.fields[0][0] && this.state.fields[0][0] == this.state.fields[1][1] && this.state.fields[0][0] == this.state.fields[2][2]){
     winner = this.state.fields[0][0]
    }
    if(this.state.fields[0][2] && this.state.fields[0][2] == this.state.fields[1][1] && this.state.fields[0][2] == this.state.fields[2][0]){
     winner = this.state.fields[0][2]
    }

    return winner;

  }

module.exports = GameState;
