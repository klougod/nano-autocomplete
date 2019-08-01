import {listClassName, itemClassName, activeItemClassName, listId} from '../helpers/consts.js';
import {geocodeAddress} from '../webserrvice/mapbox.js';

export class NanoAutocomplete {

  constructor(input){
    this.target_input = input;
    this.lastList = null;
    this.currentFocus = -1;
    NanoAutocomplete.initClickoutHandler();
    this.initInputHandler();
    this.initKeyDownEvent();
  }


  // clickout event handler
  static initClickoutHandler() {
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
      const val = this.target_input.value.trim();
  
      NanoAutocomplete.removeList();
      if(!val) {return false;}
      this.currentFocus = -1;
  
      const itemslist = document.createElement("DIV");
      itemslist.setAttribute("id", listId);
      itemslist.setAttribute("class", listClassName);
      this.target_input.parentNode.appendChild(itemslist);
  
      const results = await geocodeAddress(`localhost/geocode?address=${val}`);
      if(!results.error){
        const arr = results.data;
        if(arr.length <= 0 && lastList){
          NanoAutocomplete.removeList();
          this.target_input.parentNode.appendChild(lastList);
        }
        else{
          for(let i = 0; i < arr.length; i++){
            const address = arr[i].address;
            const latlng = arr[i].latlon;
            this.createItem(itemslist, address, latlng, val);
          }
          this.lastList = itemslist;
        }
      }
    });r
  }

  // key event handler, controls the the keys that trigger and select
  // autocomplete items, also set the active item
  initKeyDownEvent() {
    this.target_input.addEventListener("keydown", (e) => {
      let x = document.getElementById(listId);
      if(x) x = x.getElementsByTagName('div');
      // arrow down handler
      if (e.keyCode === 40) {
        this.currentFocus++;
        NanoAutocomplete.addActive(x);
      } 
      // arrow up handler
      else if (e.keyCode == 38) {
        this.currentFocus--;
        NanoAutocomplete.addActive(x);
      
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

  clickItemHandler() {
    const btn_input = this;
    target_input.value = btn_input.getElementsByTagName("input")[0].value;
    const latlng = btn_input.getElementsByTagName("input")[1].value.split(',');
    NanoAutocomplete.removeList();
    if(/home/g.test(input.id)){
      fillCoordinates('home', latlng[0], latlng[1]);
    }
    else if(/work/g.test(input.id)){
      fillCoordinates('work', latlng[0], latlng[1]);
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
    else{
      item.innerHTML = address;
    }
    item.innerHTML += `<input type='hidden' value='${address}'>`;
    item.innerHTML += `<input type='hidden' value='${latlng}'>`;

    item.addEventListener("click", clickItemHandler);
    list.appendChild(item);
  }

  static addActive(items) {
    if (!items) return false;
    NanoAutocomplete.removeActive(items);
    if (this.currentFocus >= items.length) this.currentFocus = 0;
    if (this.currentFocus < 0) this.currentFocus = (items.length - 1);
    items[this.currentFocus].classList.add(activeItemClassName);
  }

  static removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove(activeItemClassName);
    }
  }

  // remove the list of element, realize its faster to wrap all elements and
  // remove the parent element than remove one by one, this function was the
  // the hot spot in performance of this autocomplete, was much slower before
  static removeList() {
    const list = document.getElementById(listId);
    list ? list.parentNode.removeChild(list) : null;
  }

  static fillInputs(inputs, value) {
    Array.from(inputs).forEach((input) => {
      input.value = value;
    });
  };
  
  // need the class prefix to fill the lat and lng inputs, not so happy with it
  // but is working just fine, even though I would prefer it more generic
  async fillCoordinates(class_prefix, lat, lng) {
    const lat_inputs = document.getElementsByClassName(`${class_prefix}_lat`);
    const lng_inputs = document.getElementsByClassName(`${class_prefix}_lng`);
    NanoAutocomplete.fillInputs(lat_inputs, lat);
    NanoAutocomplete.fillInputs(lng_inputs, lng);
  };

}
