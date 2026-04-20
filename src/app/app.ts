import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RemoteLoaderComponent } from './components/remote-loader/remote-loader.component';
import {
  IBizEntity,
  IBizEntityInput,
  IFederationInputs,
  IFederationOutputEvent,
  FederationOutputEventName,
} from './contracts/federation-contract';

// Re-export so existing importers of app.ts are not broken.
export type { IBizEntity, IBizEntityInput, IFederationInputs, IFederationOutputEvent };
export { FederationOutputEventName };


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RemoteLoaderComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  uuid = 'ff52fbca-ef7d-4fc1-b2a7-b61549ddd288';
  uuid2 = '';
  
  input: IFederationInputs = {
    entity: {
      name: 'Sample Deliverable',
      shortName: 'SD-001',
      description: 'A sample deliverable for testing the remote component loader.',
      draft: false,
      ownerId: 'user-123',
      parentId: null as string | null,
      archived: false,
      createdOn: new Date().toISOString(),
      modifiedOn: null as string | null
    }
  }

  /** Returns the host's @angular/forms version from the Native Federation externals map. */
  get hostFormsVersion(): string {
    const externals: Map<string, string> = (window as any).__NATIVE_FEDERATION__?.externals;
    if (!externals) return 'unknown';
    const entry = [...externals.keys()].find(
      (key) => key.startsWith('@angular/forms@') && !externals.get(key)!.startsWith('http')
    );
    return entry ? entry.substring('@angular/forms@'.length) : 'unknown';
  }

  onComponentEvent(event: IFederationOutputEvent): void {
    console.log('[RemoteLoader] Event received:', event);
    // Examlpe to show that this will give error
    // if(event.event === FederationOutputEventName.ValueChange) {
    //   console.log('Payload:', event.payload);
    // }
  }

  valueChange(): void {
    console.log('Input value changed:', this.input);
    const entity = Array.isArray(this.input.entity)
      ? this.input.entity[0]
      : this.input.entity;
    if (entity) {
      entity.name = entity.name === 'Sample Deliverable'
        ? 'Some different Name'
        : 'Sample Deliverable';
    }
  }
}
