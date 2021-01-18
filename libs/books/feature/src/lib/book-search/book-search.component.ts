import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  addToReadingList,
  clearSearch,
  getAllBooks,
  ReadingListBook,
  searchBooks,
  getReadingList,
  removeFromReadingList
} from '@tmo/books/data-access';
import { FormBuilder } from '@angular/forms';
import { Book, ReadingListItem } from '@tmo/shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'tmo-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.scss']
})
export class BookSearchComponent implements OnInit {
  books: ReadingListBook[];
  readingList$ = this.store.select(getReadingList);
  recentlyAdded: Book;
  readingList: ReadingListItem[];

  searchForm = this.fb.group({
    term: ''
  });

  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {}

  get searchTerm(): string {
    return this.searchForm.value.term;
  }

  ngOnInit(): void {
    this.store.select(getAllBooks).subscribe(books => {
      this.books = books;
    });

    this.readingList$.subscribe((items:any) => {
      this.readingList = items;
    });
  }

  formatDate(date: void | string) {
    return date
      ? new Intl.DateTimeFormat('en-US').format(new Date(date))
      : undefined;
  }

  addBookToReadingList(book: Book) {
    this.store.dispatch(addToReadingList({ book }));
    this.recentlyAdded = book;
    this.openSnackBar("Book was added to reading list", "Undo");
  }

  openSnackBar(message: string, action: string) {
    let snackBarRef = this._snackBar.open(message, action, {
      duration: 5000,
    });

    
    snackBarRef.onAction().subscribe(() => { this.removeFromReadingList();  });
  }

  removeFromReadingList() {
    this.readingList.map((item) => {
      if(item && item.bookId == this.recentlyAdded.id){
        this.store.dispatch(removeFromReadingList({ item }));
      }
    })
  }

  searchExample() {
    this.searchForm.controls.term.setValue('javascript');
    this.searchBooks();
  }

  searchBooks() {
    if (this.searchForm.value.term) {
      this.store.dispatch(searchBooks({ term: this.searchTerm }));
    } else {
      this.store.dispatch(clearSearch());
    }
  }

  onSearchChange(searchValue: string): void {  
    if(searchValue === ""){
      this.books = [];
    }else{
      this.searchForm.value.term = searchValue;
      this.searchBooks();
    }
  }
}
