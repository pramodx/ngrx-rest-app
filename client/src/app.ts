import {Observable} from 'rxjs/Observable';
import {Item, ItemsService, AppStore} from './items';
import {Store} from '@ngrx/store';
import {Component, ChangeDetectionStrategy, EventEmitter, Output, Input} from '@angular/core';

@Component({
	selector: 'items-list',
	template: `
		<div *ngFor="let item of items" (click)="selected.emit(item)"
    class="item-card mdl-card mdl-shadow--2dp">
    <div class="mdl-card__title">
      <h2 class="mdl-card__title-text">{{item.name}}</h2>
    </div>
    <div class="mdl-card__supporting-text">
      {{item.description}}
    </div>
    <div class="mdl-card__menu">
      <button (click)="deleted.emit(item); $event.stopPropagation();"
        class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
        <i class="material-icons">close</i>
      </button>
    </div>
  </div>
`
})
class ItemList {
	@Input() items: Item[];
	@Output() selected = new EventEmitter();
	@Output() deleted = new EventEmitter();
}


@Component({
	selector: 'item-detail',
	template: `
	<div class="item-card mdl-card mdl-shadow--2dp">
    <div class="mdl-card__title">
      <h2 class="mdl-card__title-text" *ngIf="selectedItem.id">Editing {{originalName}}</h2>
      <h2 class="mdl-card__title-text" *ngIf="!selectedItem.id">Create New Item</h2>
    </div>
    <div class="mdl-card__supporting-text">
      <form novalidate>
          <div class="mdl-textfield mdl-js-textfield">
            <label>Item Name</label>
            <input [(ngModel)]="selectedItem.name"
              placeholder="Enter a name"
              class="mdl-textfield__input" type="text">
          </div>
          <div class="mdl-textfield mdl-js-textfield">
            <label>Item Description</label>
            <input [(ngModel)]="selectedItem.description"
              placeholder="Enter a description"
              class="mdl-textfield__input" type="text">
          </div>
      </form>
    </div>
    <div class="mdl-card__actions">
        <button type="submit" (click)="cancelled.emit(selectedItem)"
          class="mdl-button mdl-js-button mdl-js-ripple-effect">Cancel</button>
        <button type="submit" (click)="saved.emit(selectedItem)"
          class="mdl-button mdl-js-button mdl-button--colored mdl-js-ripple-effect">Save</button>
    </div>
  </div>

`
})
class ItemDetail {
	@Input('item') _item: Item;
	@Output() saved = new EventEmitter();
	@Output() cancelled = new EventEmitter();
	originalName: string;
	selectedItem: Item;
	set _item(value: Item) {
		if (value) this.originalName = value.name;
		this.selectedItem = Object.assign({}, value);
	}
}


@Component({
	selector: 'my-app',
	providers: [],
	directives: [ItemList, ItemDetail],
	template: `
<div class="mdl-cell mdl-cell--6-col">
    <items-list [items]="items | async"
      (selected)="selectItem($event)" (deleted)="deleteItem($event)">
    </items-list>
  </div>
  <div class="mdl-cell mdl-cell--6-col">
    <item-detail
      (saved)="saveItem($event)" (cancelled)="resetItem($event)"
      [item]="selectedItem | async"></item-detail>
  </div>
`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
	items: Observable<Array<Item>>;
	selectedItem: Observable<Item>;
	constructor(private itemsService: ItemsService,
	            private store: Store<AppStore>) {
		this.items = itemsService.items;
		this.selectedItem = store.select('selectedItem');
		this.selectedItem.subscribe(v => console.log(v));
		itemsService.loadItems();
	}
	selectItem(item: Item) {
		this.store.dispatch({type: 'SELECT_ITEM', payload: item});
	}
	deleteItem(item: Item) {
		this.itemsService.deleteItem(item);
	}
	saveItem(item: Item) {
		this.itemsService.saveItem(item);
		this.resetItem();
	}
	resetItem() {
		let emptyItem: Item = {id: null, name: '', description: ''};
		this.store.dispatch({type: 'SELECT_ITEM', payload: emptyItem});
	}
}
