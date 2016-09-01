import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

const BASE_URL = 'http://localhost:3000/items/';
const HEADER = { headers: new Headers({ 'Content-Type': 'application/json' }) };

/* ---------------------------------------------------------
 INTERFACES
 --------------------------------------------------------- */
export interface Item {
	id: number;
	name: string;
	description: string;
}
;

export interface AppStore {
	items: Item[];
	selectedItem: Item;
}

/* ---------------------------------------------------------
 REDUCERS
 --------------------------------------------------------- */
//The items reducers performs action on our list of items
export const items = (state: any = [], {type, payload}) => {
	switch (type) {
		case 'ADD_ITEMS':
			return payload;
		case 'CREATE_ITEM':
			return [...state, payload];
		case 'UPDATE_ITEM':
			return state.map(item => {
				return item.id === payload.id ? Object.assign({}, item, payload) : item;
			});
		case 'DELETE_ITEM':
			return state.filter(item => {
				return item.id !== payload.id;
			});
		default:
			return state;
	}
};

//The selectedItem reducer handles the currently selected item
export const selectedItem = (state: any = [], {type, payload}) => {
	switch (type) {
		case 'SELECT_ITEM':
			return payload;
		default:
			return state;
	}
};

//-------------------------------------------------------------------
// ITEMS SERVICE
//-------------------------------------------------------------------
@Injectable()
export class ItemsService {
	items: Observable<Array<Item>>;
	constructor(private http: Http, private store: Store<AppStore>) {
		this.items = store.select('items');
	}
	loadItems() {
		this.http.get(BASE_URL)
			.map(res => res.json())
			.map(payload => ({ type: 'ADD_ITEMS', payload }))
			.subscribe(action => this.store.dispatch(action));
	}
	deleteItem(item: Item) {
		this.http.delete(`${BASE_URL}${item.id}`)
			.subscribe(action => this.store.dispatch({ type: 'DELETE_ITEM', payload: item }));
	}
	createItem(item: Item) {
		this.http.post(BASE_URL, JSON.stringify(item), HEADER)
			.map(res => res.json())
			.map(payload => ({ type: 'CREATE_ITEM', payload }))
			.subscribe(action => this.store.dispatch(action));
	}
	updateItem(item: Item) {
		this.http.put(`${BASE_URL}${item.id}`, JSON.stringify(item), HEADER)
			.subscribe(action => this.store.dispatch({ type: 'UPDATE_ITEM', payload: item }));
	}
	saveItem(item: Item) {
		(item.id) ? this.updateItem(item) : this.createItem(item);
	}
}
