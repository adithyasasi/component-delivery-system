import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RemoteLoaderComponent } from './components/remote-loader/remote-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RemoteLoaderComponent, FormsModule, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  uuid = '';

  // Sample complex input matching the DeliverableDetailComponent's @Input() entity shape
  entity = {
    name: 'Sample Deliverable',
    shortName: 'SD-001',
    description: 'A sample deliverable for testing the remote component loader.',
    draft: false,
    ownerId: 'user-123',
    parentId: null as string | null,
    archived: false,
    createdOn: new Date().toISOString(),
    modifiedOn: null as string | null
  };

  lastEvent: { event: string; payload: unknown } | null = null;

  onComponentEvent(event: { event: string; payload: unknown }): void {
    this.lastEvent = event;
    console.log('[RemoteLoader] Event received:', event);
  }

  changeParentID(): void {
    if (this.entity.parentId === null) {
      this.entity.parentId = `parent-${Math.floor(Math.random() * 1000)}`;
    } else {
      this.entity.parentId = null;
    }
   }
}
