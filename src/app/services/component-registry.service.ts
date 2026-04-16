import { Injectable, Type } from '@angular/core';
import {
  loadRemoteModule,
  fetchAndRegisterRemote,
} from '@angular-architects/native-federation';

interface ComponentManifest {
  uuid: string;
  name: string;
  exposedModule: string;
  exposedModules: string[];
  remoteEntry: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ComponentRegistryService {
  private readonly BASE_URL = 'http://localhost:3000';

  /**
   * Load a remote component class by UUID.
   *
   * For remotes that existed at app boot, they were pre-registered via
   * initFederation() in main.ts (import map already has their scoped entries).
   *
   * For remotes uploaded AFTER boot, fetchAndRegisterRemote is called first
   * to dynamically add them to the import map before loading.
   */
  async loadComponentClass(uuid: string): Promise<Type<unknown>> {
    // Fetch metadata from the registry server
    const manifest: ComponentManifest = await fetch(
      `${this.BASE_URL}/components/${uuid}/manifest`
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Component "${uuid}" not found (${res.status})`);
      return res.json();
    });

    // Ensure the remote is registered in the import map.
    // If it was already registered during initFederation(), this is a no-op.
    // If it's a newly uploaded remote, this registers it dynamically.
    await fetchAndRegisterRemote(manifest.remoteEntry, manifest.name);
    
    // console.log("Called fetchAndRegisterRemote for", manifest.remoteEntry, "as", manifest.name);
    // Load the exposed module using the registered remote name
    const module = await loadRemoteModule({
      remoteName: manifest.name,
      exposedModule: manifest.exposedModule,
    });


    // Find the exported Angular component class
    const componentClass = Object.values(module).find(
      (v) => v && typeof v === 'function' && !!(v as any).ɵcmp
    );

    if (!componentClass) {
      throw new Error(
        `No Angular component found in remote module "${manifest.exposedModule}" for "${uuid}"`
      );
    }
    // console.log("loaded component class for", uuid, ":", componentClass);
    return componentClass as Type<unknown>;
  }
}
