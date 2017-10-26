import React, { Component } from 'react';
import './App.css';
import { ListGroup, ListGroupItem, Navbar, Nav, NavItem, MenuItem, NavDropdown,
  FormGroup, ControlLabel, FormControl, HelpBlock, Button, Col, Row} from 'react-bootstrap';
import { Chart } from 'react-google-charts';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

class App extends Component {
  constructor(props) {
    super(props);
    this.selectedOption = -1;
    this.optionsString = "";
    this.state = {user: false, page: 1, polls: [], poll: {}, newPoll: {title: "", options: [], cuid: "", dateAdded: new Date()}, chartData: [], newVoteValue: "", isLoading: false};
  }

  componentDidMount() {
    this.getPolls('/api/polls');
    this.getUser();
  }
  
  isLoggedIn = () => {
    return (this.state.user && this.state.user.twitter);
  }
  
  isOwner = () => {
    return this.isLoggedIn() && this.state.poll && (this.state.poll.userId === this.state.user._id);
  }
  
  getUser = () => {
    this.setState({isLoading: true});
    fetch('/user', {credentials: 'include'})
      .then((res) => {
        if (!res.redirected) {
          return res.json(); 
        }
        console.log('not logged in');
      }).then((data) => {
        console.log(data);
        this.setState({user: data, isLoading: false});
        console.log(data);
      })
  }
  
  getPolls = (str) => {
    this.setState({isLoading: true});
    fetch(str, {credentials: 'include'})
      .then((res) => {
        console.log(res);
        return res.json();
      }).then((data) => {
        this.setState({polls: data.polls, isLoading: false});
      })
  }

  handleSelect = (sk) => {
    if (sk == 1) {
      this.getPolls('/api/polls');
    }
    else if (sk == 2) {
      this.getPolls('/api/mypolls');
    }
    this.setState({page: sk});
  }

  submitPoll = (event) => {
    event.preventDefault();
    this.setState({isLoading: true});
    fetch('/api/polls', {
      headers: { 'content-type': 'application/json' },
      method: "post",
      body: JSON.stringify({poll: this.state.newPoll}),
      credentials: 'include'
    })
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      this.getPolls('/api/polls');
      console.log(json);
      this.setState({poll: json.poll, isLoading: false});
      this.pollDataToChartData(json.poll);
      return json;
    })
    .then(
      response => response,
      error => error
    );
  }
  
  deletePoll = (id) => {
    var url = '/api/polls/'+id;
    this.setState({isLoading: true});
    fetch(url, {
      method: "delete",
      credentials: 'include'
    })
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      this.handleSelect(1);
      this.setState({isLoading: false});
      return json;
    })
    .then(
      response => response,
      error => error
    );
  }

  submitVote = (event) => {
    event.preventDefault();
    //this.setState({isLoading: true});
    fetch(('/api/polls/' + this.state.poll.cuid + '/' + this.selectedOption), {
      method: "post",
      credentials: 'include'
    })
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      this.setState({poll: json.updatedPoll});
      this.pollDataToChartData(json.updatedPoll);
      return json;
    })
    .then(
      response => response,
      error => error
    );
  }
  
  onNewVoteChange = (event) => {
    this.setState({newVoteValue: event.target.value});
  }
  
  voteNewOption = (newVote) => {
    this.setState({isLoading: true});
    fetch(('/api/polls/' + this.state.poll.cuid + '/new/' + this.state.newVoteValue), {
      method: "post",
      credentials: 'include'
    })
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      this.setState({isLoading: false});
      this.getPoll(json.updatedPoll.cuid);
      return json;
    })
    .then(
      response => response,
      error => error
    );
    
  }
  
  handleVoteChange = (event) => {
    this.selectedOption = event.target.value;
  }

  getPoll = (cuid) => {
    //fetch poll with cuid
    this.setState({isLoading: true});
    fetch('/api/polls/' + cuid,{credentials: 'include'})
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      this.setState({poll: data.poll, isLoading: false});
      this.pollDataToChartData(data.poll);
    })
  }
  
  pollDataToChartData(poll) {
    var data = [['Option', 'Vote']];
    for (var i = 0; i < poll.options.length; i++) {
      var item = poll.options[i][0];
      data.push([item.title, item.votes]);
    }
    console.log(data);
    this.setState({chartData: data});
  }

  render() {
    return (
      <Router>
        {!this.state.isLoading ?
          <div className="App">
          <Navbar inverse>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="#">Voting</a>
              </Navbar.Brand>
            </Navbar.Header>
            <Nav pullRight onSelect={this.handleSelect}>
            <LinkContainer to="/">
              <NavItem eventKey={1} href="#">Home</NavItem>
            </LinkContainer>
              {this.state.user ?
             <LinkContainer to="/mypolls">
              <NavItem eventKey={2} href="#">My Polls</NavItem>
            </LinkContainer>
              :
              ""
              }
              {this.state.user ?
              <LinkContainer to="/newpoll">
              <NavItem eventKey={3} href="#">New Poll</NavItem>
              </LinkContainer>
              :
              ""
              }}
              {this.state.user ? 
              <NavDropdown pullRight eventKey={3} title={this.state.user.twitter ? this.state.user.twitter.displayName : ""} id="basic-nav-dropdown">
                <MenuItem href="/logout">Sign Out</MenuItem>
              </NavDropdown>
              :
              <a href="/auth/twitter">Sign in with Twitter</a>
              }
            </Nav>
          </Navbar>
        
        <Route exact path="/" component={this.renderList}/>
        <Route path="/newpoll" component={this.renderNewPoll}/>
        <Route path="/mypolls" component={this.renderList}/>
        <Route path="/poll/:id" component={this.renderPollView}/>

      </div>
       :
        <div>Loading...</div>
        }
      </Router>
    );
  }

  renderList = () => {
    return <div className="row">
    <ListGroup>
      {this.state.polls.map((item, i) => {
        return <LinkContainer to={"/poll/"+item.cuid}><ListGroupItem>{item.title}</ListGroupItem></LinkContainer>
      })}
  </ListGroup>
  </div>
  }

  handleChange = (event) => {
    var value = event.target.value;
    switch(event.target.id) {
      case "title":
        this.setState({newPoll: {title: value, options: this.state.newPoll.options,
        cuid: this.state.newPoll.cuid, dateAdded: this.state.newPoll.dateAdded}})
        break;
      case "options":
        this.optionsString = value;
        var options = value.split(",");
        var newOptions = [];
        for (var i = 0; i < options.length; i++) {
          newOptions.push({title: options[i], votes: 0});
        };
        this.setState({newPoll: {...this.state.newPoll, options: newOptions}});
        break;
    }
  }

  renderNewPoll = () => {
      return (
    <form onSubmit={this.submitPoll}>
      <FormGroup
        controlId="formBasicText"
      >
        <ControlLabel>Title</ControlLabel>
        <FormControl
          type="text"
          value={this.state.newPoll.title}
          placeholder="Title"
          id="title"
          onChange={this.handleChange}
        />
      <ControlLabel>Options</ControlLabel>
      <FormControl
        id="options"
        componentClass="textarea"
        placeholder="comma separated list"
        onChange={this.handleChange} />
      </FormGroup>
      <Button type="submit">
        Submit
      </Button>
    </form>
  );
  }

  renderPollView = (props) => {
    if (isEmpty(this.state.poll) || (this.state.poll.cuid != props.match.params.id)) {
      this.getPoll(props.match.params.id);
    }
    return (
      <Row>
        <Col md={6}>
          <form onSubmit={this.submitVote}>
            <FormGroup controlId="formControlsSelect">
              <ControlLabel>Select</ControlLabel>
              <FormControl componentClass="select" placeholder="select" onChange={this.handleVoteChange}>
                <option value="select">select</option>
                {this.state.poll.options && this.state.poll.options.map((item, i) => {
                  return <option value={i}>{item[0].title}</option>
                })}
              </FormControl>
              {this.isLoggedIn()?
              <span>Other:<input value={this.state.newVoteValue} onChange={this.onNewVoteChange} type="text"/><Button onClick={() => this.voteNewOption(this.newVote)}>Submit</Button></span>
              :
              ""
              }
            </FormGroup>
            <Button type="submit">
              Submit
            </Button>
            {this.isLoggedIn() ?
            <Button onClick={() => {window.open("https://twitter.com/intent/tweet?text=" + window.location.href)}}>Tweet it</Button>
            :
            ""
            }
          </form>
        </Col>
        <Col md={6}>
          <div className={'my-pretty-chart-container'}>
            <Chart
              chartType="PieChart"
              data={this.state.chartData}
              options={{}}
              graph_id="PieChart"
              width="100%"
              height="400px"
              legend_toggle
            />
          </div>
          {this.isOwner() ? 
          <Button onClick={() => this.deletePoll(this.state.poll.cuid)}>DELETE</Button>
          :
          ""
          }
        </Col>
      </Row>
    );
  }
  
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export default App;
