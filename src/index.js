import {listClassName, itemClassName, activeItemClassName, listId} from './helpers/consts.js';
import MapBox from './webservice/mapbox.js';

export default class NanoAutocomplete{

  constructor(input) {
    this.target_input = NanoAutocomplete.assignInput(input);
    console.log(this.target_input)
    this.lastList = null;
    this.currentFocus = -1;
    this.isTyping = false;
    this.minExecuteTime = 300;
    this.mapbox = new MapBox();
    this.initClickoutHandler();
    this.initInputHandler();
    this.initKeyDownHandler();
  }

  static assignInput(input) {
    const throwNotInputException = () => {throw "Not an instance of HTMLInputElement"};
    return input instanceof HTMLInputElement ? input : throwNotInputException();
  }

  // clickout event handler
  initClickoutHandler() {
    document.addEventListener('click', (e) => {
      const isClickInside = e.target.classList.contains(itemClassName);
      if(!isClickInside){
        this.removeList();
      }
    });
  }

  // input event listener, get all addresses and create autocomplete items
  initInputHandler() {
    this.target_input.addEventListener("input", async (e) => {
      if(!this.isTyping){
        this.isTyping = true;
        setTimeout(this.inputEventHandler.bind(this), this.minExecuteTime);
      }
    });
  }

  async inputEventHandler() {
    this.isTyping = false;
    const val = this.target_input.value.trim();
    this.removeList();
    if(!val) {return false;}
    this.currentFocus = -1;

    const itemslist = document.createElement("DIV");
    itemslist.setAttribute("id", listId(this.target_input.id));
    itemslist.setAttribute("class", listClassName);
    this.target_input.parentNode.appendChild(itemslist);
    console.log(this.mapbox)

    const response = await this.mapbox.geocode(val);
    console.log(response)
    if(!response.error){
      const results = response.data;
      if(results.length <= 0 && this.lastList){
        this.removeList();
        this.target_input.parentNode.appendChild(this.lastList);
      }
      else{
        for(let i = 0; i < results.length; i++){
          const address = results[i].place_name;
          const latlng = results[i].center;
          this.createItem(itemslist, address, latlng, val);
        }
        this.lastList = itemslist;
      }
    }
  }

  // key event handler, controls the the keys that trigger and select
  // autocomplete items, also set the active item
  initKeyDownHandler() {
    this.target_input.addEventListener("keydown", (e) => {
      let x = document.getElementById(listId(this.target_input.id));
      if(x) x = x.getElementsByTagName('div');
      // arrow down handler
      if (e.keyCode === 40) {
        this.currentFocus++;
        this.addActive(x);
      } 
      // arrow up handler
      else if (e.keyCode == 38) {
        this.currentFocus--;
        this.addActive(x);
      
      } 
      // tab handler
      else if (e.keyCode === 9) {
        if (this.currentFocus > -1) {
          if (x) x[this.currentFocus].click();
        }
      } 
      // enter handler
      else if (e.keyCode === 13) {
        e.preventDefault();
        if (this.currentFocus > -1) {
          if (x) x[this.currentFocus].click();
        }
      }
    });
  }

  clickItemHandler(e) {
    const btn_input = e.originalTarget;
    this.target_input.value = btn_input.getElementsByTagName("input")[0].value;
    const latlng = btn_input.getElementsByTagName("input")[1].value.split(',');
    this.removeList();
    if(/home/g.test(this.target_input.id)){
      this.fillCoordinates('home', latlng[1], latlng[0]);
    }
    else if(/work/g.test(this.target_input.id)){
      this.fillCoordinates('work', latlng[1], latlng[0]);
    }
  }

  // create and append one item to a list of items
  async createItem(list, address, latlng, input_val) {
    const item = document.createElement("DIV");
    item.classList.add(itemClassName);
    if (address.substr(0, input_val.length).toUpperCase() == input_val.toUpperCase()) {
      item.innerHTML = `<strong>${address.substr(0, input_val.length)}</strong>`;
      item.innerHTML += address.substr(input_val.length);
    }
    else {
      item.innerHTML = address;
    }
    item.innerHTML += `<input type='hidden' value='${address}'>`;
    item.innerHTML += `<input type='hidden' value='${latlng}'>`;

    item.addEventListener("click", this.clickItemHandler.bind(this));
    list.appendChild(item);
  }

  addActive(items) {
    if (!items) return false;
    this.removeActive(items);
    if (this.currentFocus >= items.length) this.currentFocus = 0;
    if (this.currentFocus < 0) this.currentFocus = (items.length - 1);
    items[this.currentFocus].classList.add(activeItemClassName);
  }

  removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove(activeItemClassName);
    }
  }

  // remove the list of element, realize its faster to wrap all elements and
  // remove the parent element than remove one by one, this function was the
  // the hot spot in performance of this autocomplete, was much slower before
  removeList() {
    const list = document.getElementById(listId(this.target_input.id));
    list ? list.parentNode.removeChild(list) : null;
  }

  fillInputs(inputs, value) {
    Array.from(inputs).forEach((input) => {
      input.value = value;
    });
  };
  
  // need the class prefix to fill the lat and lng inputs, not so happy with it
  // but is working just fine, even though I would prefer it more generic
  async fillCoordinates(class_prefix, lat, lng) {
    const lat_inputs = document.getElementsByClassName(`${class_prefix}_lat`);
    const lng_inputs = document.getElementsByClassName(`${class_prefix}_lng`);
    this.fillInputs(lat_inputs, lat);
    this.fillInputs(lng_inputs, lng);
  };

}
