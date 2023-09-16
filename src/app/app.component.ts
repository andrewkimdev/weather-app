import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';

import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private updates: SwUpdate,
    private snackBar: MatSnackBar,
  ){}

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.checkForVersionUpdates().subscribe(res => {
      if (res) {
        this.showUpdateSnackBar();
      }
    });
  }

  private checkForVersionUpdates(): Observable<boolean> {
    return this.updates.versionUpdates.pipe(
      tap((res: VersionEvent) => this.logVersionEvent(res)),
      switchMap(() => this.updates.activateUpdate().then(() => true)),
      takeUntil(this.destroy$)
    );
  }

  private showUpdateSnackBar(): void {
    const snackBarRef = this.snackBar.open('A new version is available!', 'Update now');
    snackBarRef.afterDismissed().subscribe(result => {
      if (result.dismissedByAction) {
        location.reload();
      }
    });
  }

  private logVersionEvent(event: VersionEvent): void {
    // You can use a more advanced logging mechanism here
    console.log(event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
