import { Component, OnInit } from '@angular/core';
import {BookService} from "../book.service";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  initFinishedOwnerships: boolean = false;
  initFinishedHoldings: boolean = false;

  bookOwnershipsOutput: object = [];
  bookOwnerships$: Observable<object>;
  private bookOwnerships = new Subject<object>();

  bookHoldingsOutput: object = [];
  bookHoldings$: Observable<object>;
  private bookHoldings = new Subject<object>();

  constructor(private bookService: BookService) { }

  getStatus(object): number {
    if (object['book_instance']) {
      if (object['book_instance']['arrived']) {
        return 2; // arrived
      } else {
        return 1; // travelling
      }
    } else {
      return 0; // waiting
    }
  }

  ngOnInit() {
    // Get book journeys of users

    // Start with getting ownerships
    this.bookOwnerships$ = this.bookOwnerships.asObservable();

    this.bookOwnerships$.subscribe(
      (ownings: [any]) => {
        // first, mark status of object
        for (let i = 0; i < ownings.length; i++) {
          ownings[i]['status'] = this.getStatus(ownings[i]);
        }
        // console.log(ownings); // DEBUG

        this.bookOwnershipsOutput = ownings;
        this.initFinishedOwnerships = true;
      },
      (error) => {
        console.log(error);
      }
    );
    this.bookService.getMyBookOwnings().subscribe(
      (responses) => {
        this.bookOwnerships.next(responses);
      }
    );

    // Then Book Holdings
    this.bookHoldings$ = this.bookHoldings.asObservable();

    this.bookHoldings$.subscribe(
      (holdings: [any]) => {
        for (let i = 0; i < holdings.length; i++) {
          holdings[i]['status'] = this.getStatus(holdings[i]);
        }
        // console.log(holdings); // DEBUG

        this.bookHoldingsOutput = holdings;
        this.initFinishedHoldings = true;
      },
      (error) => {
        console.log(error);
      }
    );
    this.bookService.getMyBookHoldings().subscribe(
      (responses) => {
        this.bookHoldings.next(responses);
      }
    );
  }
}
