import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrls: ['./book-list-item.component.css', '../book-list.component.css'],
})
export class BookListItemComponent implements OnInit {
  @Input() item: object;

  constructor() { }

  ngOnInit() {
  }
}
