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

  /** Returns the host's @angular/forms version from the Native Federation externals map. */
  get hostFormsVersion(): string {
    const externals: Map<string, string> = (window as any).__NATIVE_FEDERATION__?.externals;
    if (!externals) return 'unknown';
    const entry = [...externals.keys()].find(
      (key) => key.startsWith('@angular/forms@') && !externals.get(key)!.startsWith('http')
    );
    return entry ? entry.substring('@angular/forms@'.length) : 'unknown';
  }

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

  onComponentEvent(event: { event: string; payload: unknown }): void {
    console.log('[RemoteLoader] Event received:', event);
  }

  valueChange(): void {
    if (this.entity.name === "Some different Name") {
      this.entity.name = `Other Name`;
    } else {
      this.entity.name = "Some different Name";
    }
   }
}
