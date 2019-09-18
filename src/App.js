import React from 'react';
import ReactLoading from 'react-loading';
import io from 'socket.io-client';
import logo from './logo.svg';
import SVG from 'react-inlinesvg';
import { CSSTransition } from 'react-transition-group';
import { SwitchTransition } from 'react-transition-group';

import './App.css';

const socket = io();

class Field extends React.Component {

  render(){

    var mark = null;
    var el_field_marked = null;

    if(this.props.val){
      mark = this.props.val.mark;

    }

    if(mark == "x"){
      el_field_marked = <SVG src="x.svg"/>
    }
    else if(mark == "o"){
      el_field_marked = <SVG src="o.svg"/>
    }

    return (
    <div onClick={this.props.handleFieldClick} className={"field " + mark + " " + (this.props.val.winned ? "winned" : null) }>
      {el_field_marked}
    </div>);
  }

}

class Board extends React.Component {

  render(){
    return (<div className="board">
      {this.props.children}
    </div>);
  }

}

class Game extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      fields: [
        [{}, {}, {}],
        [{}, {}, {}],
        [{}, {}, {}]
      ],
      turn: "x",
      winner: null
    }

    socket.on("field_checked", (row,col)=>{

      this.markField(row,col, this.props.mark=="x" ? "o" : "x");
      var winner = this.checkEndOfGame();


    })
  }

  checkEndOfGame = ()=>{

    var winner = null;
    var new_fields = null;

    if(this.state.fields[0][0].mark && this.state.fields[0][0].mark == this.state.fields[0][1].mark && this.state.fields[0][0].mark == this.state.fields[0][2].mark){
      winner = this.state.fields[0][0].mark;
      new_fields = this.highlightWinnedTrack("row", 0);
    }
    if(this.state.fields[1][0].mark && this.state.fields[1][0].mark == this.state.fields[1][1].mark && this.state.fields[1][0].mark == this.state.fields[1][2].mark){
     winner = this.state.fields[1][0].mark;
     new_fields = this.highlightWinnedTrack("row", 1);
    }
    if(this.state.fields[2][0].mark && this.state.fields[2][0].mark == this.state.fields[2][1].mark && this.state.fields[2][0].mark == this.state.fields[2][2].mark){
     winner = this.state.fields[2][0].mark;
     new_fields = this.highlightWinnedTrack("row", 2);
    }


    if(this.state.fields[0][0].mark && this.state.fields[0][0].mark == this.state.fields[1][0].mark && this.state.fields[0][0].mark == this.state.fields[2][0].mark){
     winner = this.state.fields[0][0].mark;
     new_fields = this.highlightWinnedTrack("col", 0);
    }
    if(this.state.fields[0][1].mark && this.state.fields[0][1].mark == this.state.fields[1][1].mark && this.state.fields[0][1].mark == this.state.fields[2][1].mark){
     winner = this.state.fields[0][1].mark;
     new_fields = this.highlightWinnedTrack("col", 1);
    }
    if(this.state.fields[0][2].mark && this.state.fields[0][2].mark == this.state.fields[1][2].mark && this.state.fields[0][2].mark == this.state.fields[2][2].mark){
     winner = this.state.fields[0][2].mark;
     new_fields = this.highlightWinnedTrack("col", 2);
    }

    if(this.state.fields[0][0].mark && this.state.fields[0][0].mark == this.state.fields[1][1].mark && this.state.fields[0][0].mark == this.state.fields[2][2].mark){
     winner = this.state.fields[0][0].mark;
     new_fields = this.highlightWinnedTrack("diag", 0);
    }
    if(this.state.fields[0][2].mark && this.state.fields[0][2].mark == this.state.fields[1][1].mark && this.state.fields[0][2].mark == this.state.fields[2][0].mark){
     winner = this.state.fields[0][2].mark;
     new_fields = this.highlightWinnedTrack("diag", 1);
    }

    if(winner){
      this.setState({
        fields: new_fields,
        winner: winner
      })
    }

    return winner;

  }

  highlightWinnedTrack = (track, id)=>{

    var new_fields = this.state.fields.slice();

    if(track == "row"){

      new_fields[id][0] = {...new_fields[id][0], ...{winned: true } };
      new_fields[id][1] = {...new_fields[id][1], ...{winned: true } };
      new_fields[id][2] = {...new_fields[id][2], ...{winned: true } };

    }
    else if(track=="col"){

      new_fields[0][id] = {...new_fields[0][id], ...{winned: true } };
      new_fields[1][id] = {...new_fields[1][id], ...{winned: true } };
      new_fields[2][id] = {...new_fields[2][id], ...{winned: true } };

    }
    else if(track=="diag"){

      if(id==0){
        new_fields[id][id] = { ...new_fields[id][id], ...{winned: true}};
        new_fields[id+1][id+1] = { ...new_fields[id+1][id+1], ...{winned: true}};
        new_fields[id+2][id+1] = { ...new_fields[id+2][id+2], ...{winned: true}};
      }
      else if(id==1){
        new_fields[0][2] = {...new_fields[0][2], ...{winned: true}};
        new_fields[1][1] = {...new_fields[1][1], ...{winned: true}};
        new_fields[2][0] = {...new_fields[2][0], ...{winned: true}};
      }

    }

    return new_fields;


  }

  handleFieldClick = (row, col)=>{

    if(this.state.winner){
      return;
    }

    if(this.state.turn != this.props.mark){
      return;
    }

    var cur_field_state = this.state.fields[row][col];

    if(cur_field_state.mark != null){
      return;
    }

    this.markField(row,col, this.props.mark );

    socket.emit("field_check", row, col);

    var winner = this.checkEndOfGame();

  }

  markField = (row, col, mark)=>{

    var new_fields = this.state.fields.slice();
    new_fields[row][col] = {
      mark: mark
    }

    var next_turn="";
    if(this.state.turn==="x")
      next_turn="o";
    if(this.state.turn==="o")
      next_turn="x";

    this.setState({
      turn: next_turn,
      fields: new_fields
    })

  }

  render(){

    var el = null;

    if(this.state.winner){
      el = <div>{this.state.winner} wins !</div>;
    }
    else{
      el = <div>Turn of: {(this.state.turn).toUpperCase()}</div>
    }

    return (
      <div className="game">
        {el}
        <Board>
          <Field handleFieldClick={()=>(this.handleFieldClick(0,0))} val={this.state.fields[0][0]}/>
          <Field handleFieldClick={()=>(this.handleFieldClick(0,1))} val={this.state.fields[0][1]}/>
          <Field handleFieldClick={()=>(this.handleFieldClick(0,2))} val={this.state.fields[0][2]}/>
          <Field handleFieldClick={()=>(this.handleFieldClick(1,0))} val={this.state.fields[1][0]}/>
          <Field handleFieldClick={()=>(this.handleFieldClick(1,1))} val={this.state.fields[1][1]}/>
          <Field handleFieldClick={()=>(this.handleFieldClick(1,2))} val={this.state.fields[1][2]}/>
          <Field handleFieldClick={()=>(this.handleFieldClick(2,0))} val={this.state.fields[2][0]}/>
          <Field handleFieldClick={()=>(this.handleFieldClick(2,1))} val={this.state.fields[2][1]}/>
          <Field handleFieldClick={()=>(this.handleFieldClick(2,2))} val={this.state.fields[2][2]}/>
        </Board>
        {this.state.winner ? <button className="btn" onClick={this.props.returnToMainPage}>POWRÓT DO STORNY GŁÓWNEJ</button> : null}
      </div>
    );
  }
}

class WelcomePage extends React.Component {

    constructor(props){
      super(props);
      this.state = {
        searchActive: false
      }
      this.input = React.createRef();
    }

    searchOpponent = (e)=>{
      this.setState({
        searchActive: true
      })

      this.props.onSearchOpponentStart(this.input.current.value);

      e.preventDefault();

    }

    render(){



      var el_onsearch = (
        <div key={this.state.searchActive ? "1" : "2"} className="loading-panel">
          <ReactLoading type="spokes" />
          Oczekiwanie na przeciwnika
        </div>
      );

      var el_beforesearch = (
        <form key={this.state.searchActive ? "1" : "2"}>
          <input type="text" placeholder="Login" ref={this.input} />
          <button className="btn" onClick={this.searchOpponent}>SZUKAJ PRZECIWNIKA</button>
        </form>
      );

      return (
        <div className="welcome-page">
          <SwitchTransition>
            <CSSTransition key={this.state.searchActive ? "1" : "2"} timeout={350} classNames="react-transition">
              {this.state.searchActive ? el_onsearch : el_beforesearch }
            </CSSTransition>
          </SwitchTransition>
        </div>
      )

    }

}

class OpponentsHeader extends React.Component{

  render(){
    var el_oh = null;
    if(this.props.marker=="x"){
      el_oh = <span><span className="x">{this.props.loggedAs}</span> vs <span className="o">{this.props.opponentName ? this.props.opponentName : "???"}</span></span>
    }
    if(this.props.marker=="o"){
      el_oh = <span><span className="x">{this.props.opponentName ? this.props.opponentName : "???"}</span> vs <span className="o">{this.props.loggedAs}</span></span>
    }

    return (
      <div className="opponent-header">
      {el_oh}
      </div>
    );
  }

}

class App extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      loggedAs: null,
      opponentName: null,
      gameActive: false,
      mark: null
    }


    socket.on("game_start", (opponent_name, mark)=>{

      this.setState({
        opponentName: opponent_name,
        gameActive: true
      })

    });

  }

  onSearchOpponentStart = (loggedAs)=>{

    socket.emit("search_opponent", loggedAs, (mark)=>{
      this.setState({
        mark: mark
      })
    });
    this.setState({
      loggedAs: loggedAs
    })

  }

  returnToMainPage = ()=>{

    this.setState(
      {
        loggedAs: null,
        opponentName: null,
        gameActive: false,
        mark: null
      }
    );

  }

  render(){

    var el = null;

    if(this.state.gameActive){
      el = <Game mark={this.state.mark} returnToMainPage={this.returnToMainPage}/>
    }
    else{
      el = <WelcomePage onSearchOpponentStart={this.onSearchOpponentStart}/>
    }

    return (
      <div className="app">
        <div className="banner">Tic-Tac-Toe</div>
        {this.state.mark && <OpponentsHeader marker={this.state.mark} loggedAs={this.state.loggedAs} opponentName={this.state.opponentName} />}
        <SwitchTransition>
          <CSSTransition key={this.state.gameActive ? "1" : "2"} timeout={350} classNames="react-transition">
            {el}
          </CSSTransition>
        </SwitchTransition>
      </div>
    );
  }
}

export default App;
