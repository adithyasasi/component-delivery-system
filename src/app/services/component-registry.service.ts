import { Injectable, Type } from '@angular/core';
import { init, parse } from 'es-module-lexer';

// Maps Angular bare specifiers to the host app's already-loaded Angular instance.
// This ensures the remote component shares the SAME Angular instance as the host,
// avoiding duplicate DI, change detection, and decorator conflicts.
const ANGULAR_MODULE_MAP: Record<string, string> = {
  '@angular/core': 'window.__loader_ng__.core',
  '@angular/common': 'window.__loader_ng__.common',
  '@angular/forms': 'window.__loader_ng__.forms',
  '@angular/router': 'window.__loader_ng__.router',
};

@Injectable({ providedIn: 'root' })
export class ComponentRegistryService {
  private readonly BASE_URL = 'http://localhost:3000/components';
  private ngInitialized = false;

  // Full pipeline: fetch bundle → rewrite imports → blob import → return component class
  async loadComponentClass(uuid: string): Promise<Type<unknown>> {
    await this.initAngularGlobals();

    const bundleUrl = `${this.BASE_URL}/${uuid}`;
    const bundleText = await fetch(bundleUrl).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch component: ${res.status} ${res.statusText}`);
      return res.text();
    });

    const rewritten = await this.rewriteAngularImports(bundleText);

    // Use Function constructor to bypass bundler static analysis of the dynamic import
    const blob = new Blob([rewritten], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);

    try {
      const module = (await new Function('url', 'return import(url)')(blobUrl)) as Record<
        string,
        unknown
      >;

      const componentClass = Object.values(module).find(
        (v) => v && typeof v === 'function' && !!(v as any).ɵcmp
      );

      if (!componentClass) {
        throw new Error('No Angular component found in bundle. Ensure the component is exported.');
      }

      return componentClass as Type<unknown>;
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  // Store the host app's Angular modules on window so the rewritten bundle can reference them.
  // ES module caching ensures these are the exact same instances the host app uses.
  private async initAngularGlobals(): Promise<void> {
    if (this.ngInitialized) return;

    const w = window as any;
    if (!w.__loader_ng__) {
      const [core, common] = await Promise.all([
        import('@angular/core'),
        import('@angular/common'),
      ]);
      w.__loader_ng__ = { core, common };
    }

    this.ngInitialized = true;
  }

  // Rewrite bare Angular import specifiers to reference the host's Angular on window.
  // Uses es-module-lexer for precise byte-offset based replacement instead of regex,
  // correctly handling any valid JS import syntax in the bundle.
  private async rewriteAngularImports(code: string): Promise<string> {
    await init;
    const [imports] = parse(code);

    // Walk in reverse so earlier offsets remain valid as we splice the string
    let result = code;
    for (const imp of [...imports].reverse()) {
      const globalRef = ANGULAR_MODULE_MAP[imp.n ?? ''];
      if (!globalRef) continue;

      const statement = code.slice(imp.ss, imp.se);
      result = result.slice(0, imp.ss) + this.convertToConst(statement, globalRef) + result.slice(imp.se);
    }

    return result;
  }

  // Converts an import statement to a const declaration referencing the host's Angular on window.
  //
  //   import * as i0 from '@angular/core'             →  const i0 = window.__loader_ng__.core;
  //   import { Input, Component } from '@angular/core' →  const { Input, Component } = window.__loader_ng__.core;
  private convertToConst(statement: string, globalRef: string): string {
    // import * as alias from 'pkg'
    const namespaceMatch = statement.match(/import\s*\*\s*as\s*(\w+)\s*from/);
    if (namespaceMatch) {
      return `const ${namespaceMatch[1]} = ${globalRef};`;
    }

    // import { A, B, C } from 'pkg'
    const namedMatch = statement.match(/import\s*\{([^}]*)\}\s*from/);
    if (namedMatch) {
      return `const {${namedMatch[1]}} = ${globalRef};`;
    }

    return statement;
  }
}
