var grail = require('grail');

module.exports = grail.BasicStoreFactory('ItemsStore', {
  items: [],
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