var grail = require('grail');
var PromisePipe = require('promise-pipe');
var React = require('react');
var Promise = require('es6-promise').Promise;
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;
require('./config');

var app = grail.createApp({Layout: require("./Layout")});

require("./node_modules/todomvc-common/base.css");
require("./node_modules/todomvc-app-css/index.css");

//render Items component
var ItemsComp = React.createClass({
    mixins: [grail.ContextMixin],
    getInitialState: function(){
    	//get initial data from ItemsStore
      return {
        items: this.context.stores.ItemsStore.get(),
        editable: null
      }
    },
    componentDidMount: function() {
    	//listen to ItemsStore changes
      this.context.stores.ItemsStore.on('change', this.change);
    },
    change: function(items){
    	//set state only if mounted
      if(!this.isMounted()) return;
      this.setState({items: items});
    },
    changeItem: function(item, evt){
      item.title = event.target.value;
      this.context.doAction('items:item:change', item);
      this.setState({editable: null});
    },
    handleKeyDown: function(item, evt){
      if (evt.which === 27) {
        this.setState({editable: null});
      } else if (evt.which === 13) {
        this.changeItem(item, evt);
        this.setState({editable: null});
      }
    },
    toggle: function(item){
      this.context.doAction('items:item:toggle', {id: item.id});
    },
    delete: function(item){
      this.context.doAction('items:item:delete', {id: item.id});
    },
    edit: function(i){
      this.setState({editable: i}, function(){
        var node = this.refs["ref" + i].getDOMNode();
        node.focus();
        node.setSelectionRange(node.value.length, node.value.length);
      }.bind(this));
    },
  	render: function () {
	    return (
      <ul id="todo-list">
        {this.state.items && this.state.items.map(function(item, i){
          var className = [item.completed?'completed':''
                          ,this.state.editable == i?'editing':''].join(' ');
          var inputRef = "ref" + i;                          
          return <li className={className}>
            <div className="view">
              <input className="toggle" type="checkbox" checked={item.completed} onChange={this.toggle.bind(this, item)}/>
              <label onDoubleClick={this.edit.bind(this, i)}>{item.title}</label>
              <button className="destroy" onClick={this.delete.bind(this, item)}></button>
            </div>
            <input className="edit" 
              ref={inputRef}
              defaultValue={item.title}  
              onBlur={this.changeItem.bind(this, item)}
              onKeyDown={this.handleKeyDown.bind(this, item)}/>
          </li>
        }.bind(this))}
      </ul>
    );
  }
});

app.appActions.create('items:add')
.then(function prepare(title){
  return {
    title: title,
    completed: false
  }
})
.post('/api/items')
.emit('items:item:added');

app.appActions.create('items:toggleAll')
.put('/api/items/toggle')
.emit('items:got');

app.appActions.create('items:clean')
.del('/api/items/clean')
.emit('items:got');


app.appActions.create('items:item:toggle')
.put('/api/items/:id/toggle')
.emit('items:item:toggle');

app.appActions.create('items:item:delete')
.del('/api/items/:id')
.emit('items:item:remove');

app.appActions.create('items:item:change')
.put('/api/items/:id')
.emit('items:item:changed');

var AppComp = React.createClass({
  mixins: [React.addons.LinkedStateMixin, grail.ContextMixin],
  getInitialState: function(){
    return {
      newItem:'',
      info: this.context.stores.ItemsStore.getInfo()
    }
  },
  componentDidMount: function() {
    //listen to ItemsStore changes
    this.context.stores.ItemsStore.on('info', this.change);
  },
  change: function(info){
    //set state only if mounted
    if(!this.isMounted()) return;
    this.setState({info: info});    
  },
  toggleAll: function(){
    this.context.doAction('items:toggleAll', {completed: !this.state.allToggled});
    this.setState({allToggled: !this.state.allToggled});
  },
  createNewItem: function(evt){
    if (evt.which !== 13 && this.state.newItem) return;
    this.context.doAction('items:add', this.state.newItem);
    this.setState({newItem:''});
  },
  clean: function(){
    this.context.doAction('items:clean');
  },
  render: function () {
    var clearButton;
    if (this.state.info&&this.state.info.completedCount > 0) {
      clearButton = (
        <button
          id="clear-completed"
          onClick={this.clean}>
          Clear completed ({this.state.info.completedCount})
        </button>
      );
    }    
    return (
      <div>
        <section id="todoapp">
          <header id="header">
            <h1>todos</h1>
            <input id="new-todo" placeholder="What needs to be done?" valueLink={this.linkState('newItem')}  
                  autofocus={true} onKeyUp={this.createNewItem}/>
          </header>
          <section id="main">
            <input id="toggle-all" type="checkbox" checked={this.state.info.isAllCompleted} onChange={this.toggleAll}/>
            <label htmlFor="toggle-all">Mark all as complete</label>
            <RouteHandler/>
          </section>
          <footer id="footer">
            <span id="todo-count">
              <strong>{this.state.info.countItemsLeft}</strong>  left
            </span>
            <ul id="filters">
              <li>
                <Link to="home">All</Link>
              </li>
              {' '}
              <li>
                <Link to="active">Active</Link>
              </li>
              {' '}
              <li>
                <Link to="completed">Completed</Link>
              </li>
            </ul>
            {clearButton}
          </footer>  
        </section>
              
        <div id="info">
          <p>Double-click to edit a todo</p>
          <p>Written by <a href="https://github.com/addyosmani">Addy Osmani</a></p>
          <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
        </div>
      </div>    
    );
  }
});


var ItemsStore = grail.BasicStoreFactory('ItemsStore', {
  items: null,
  when: {},
  init: function(context){
    context.actions.on('items:got', this.gotItems.bind(this));
    context.actions.on('items:filter', this.gotItemsFilter.bind(this));
    context.actions.on('items:item:added', this.itemAdded.bind(this));
    context.actions.on('items:item:toggle', this.itemChanged.bind(this));
    context.actions.on('items:item:changed', this.itemChanged.bind(this));
    context.actions.on('items:item:remove', this.itemRemoved.bind(this));
  },
  itemRemoved: function(Item){
    this.items = this.items.reduce(function(items, item){
      if(item.id != Item.id) items.push(item);
      return items;
    },[]);
    this.change.call(this);
  },  
  itemChanged: function(Item){
    this.items.forEach(function(item, i){
      if(item.id == Item.id){
        this.items[i] = Item;
      }
    }.bind(this))
    this.change.call(this);
  },
  itemAdded: function(Item){
    this.items.push(Item);
    this.change.call(this);
  },
  gotItemsFilter: function(when){
    this.when = when || {};
  },
  getFilteredItems: function(){
    var when = this.when;
    return this.items.reduce(function(items, item){
      var pass = true;
      Object.keys(when).forEach(function(keyName){
        if(item[keyName] != when[keyName]) pass = false;
      })
      if(pass) items.push(item);
      return items;
    }, []);
  },
  gotItems: function(items){
    this.items = items;   
    this.change.call(this);
  },
  change: function(){
    if(!this.items) return
    this.emit('info', this.getInfo.call(this));
    this.emit('change', this.getFilteredItems.call(this));
  },
  countItemsLeft: function(){
    return this.items.reduce(function(res, item){
      return item.completed?res:++res;
    }, 0);
  },  
  get: function(){
    return this.getFilteredItems.call(this);
  },
  getInfo: function(){
    var itemsLeft = this.countItemsLeft.call(this);
    return {
      count: this.items.length, 
      isAllCompleted: itemsLeft == 0,
      countItemsLeft: itemsLeft,
      completedCount: this.items.length - itemsLeft
    };
  } 
});


PromisePipe.use('emit', function emit(data, context, eventName, override){
	context.emit(eventName, override || data);
	return data;
});


//The Action for /items path. Is taking data from async source data
var getItems = PromisePipe()
.emit('items:filter', {})
.get('/api/items')
.emit('items:got');

var getActive = PromisePipe()
.emit('items:filter', {completed: false})
.get('/api/items')
.emit('items:got');

var getCompleted = PromisePipe()
.emit('items:filter', {completed: true})
.get('/api/items')
.emit('items:got');



var routes = <Route path="/" name="home" handler={AppComp} stores={ItemsStore} ignoreScrollBehavior>
    <Route name="active" path="active" handler = {ItemsComp} action={getActive} />
    <Route name="completed" path="completed" handler = {ItemsComp} action={getCompleted}/>
    <DefaultRoute handler = {ItemsComp} action={getItems} />
  </Route>


app.useRoutes(routes);


module.exports = app.init();

