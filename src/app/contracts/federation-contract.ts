/**
 * @file federation-contract.ts
 *
 * Shared contract between the HOST application and any REMOTE federated component.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  HOST  ──inputs──►  RemoteLoaderComponent  ──inputs──►  REMOTE  │
 * │  HOST  ◄─outputs─   RemoteLoaderComponent  ◄─outputs─   REMOTE  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Both sides MUST agree on these types.
 * Remote component developers should import from this file (or a published
 * npm package that re-exports it) to guarantee type-safety at both ends.
 */

// ---------------------------------------------------------------------------
// Domain Models
// ---------------------------------------------------------------------------

/** Core business-entity data model shared across the platform. */
export interface IBizEntity {
  /** Display name of the entity. */
  name: string;
  /** Short identifier / code. */
  shortName: string;
  /** Human-readable description. */
  description: string;
  /** Whether the entity is still in draft state. */
  draft: boolean;
  /** ID of the user who owns this entity. */
  ownerId: string;
  /** UUID of the parent entity, or null if top-level. */
  parentId: string | null;
  /** Whether the entity has been soft-deleted / archived. */
  archived: boolean;
  /** ISO-8601 creation timestamp. */
  createdOn: string;
  /** ISO-8601 last-modified timestamp, or null if never modified. */
  modifiedOn: string | null;
}

// ---------------------------------------------------------------------------
// Input Contract  (HOST → REMOTE)
// ---------------------------------------------------------------------------

/**
 * Convenience alias: a single entity **or** an array of entities.
 * Use this type for `@Input()` declarations in remote components instead of
 * repeating the union everywhere.
 */
export type IBizEntityInput = IBizEntity | IBizEntity[];

/**
 * All `@Input()` properties that a remote component MUST accept.
 *
 * Remote components should declare these as Angular `@Input()` properties
 * using the matching property names so the host can bind to them
 * via `ComponentRef.setInput()`.
 */
export interface IFederationInputs {
  /** A single entity or a list of entities to display / operate on. */
  entity: IBizEntityInput;
}

// ---------------------------------------------------------------------------
// Output Contract  (REMOTE → HOST)
// ---------------------------------------------------------------------------

/**
 * Enum of all event names a remote component may emit.
 * Use these constants in both the remote component (`@Output()` property names)
 * and in the host's event handler (`switch` / `if` guards).
 */
export enum FederationOutputEventName {
  /** Entity was selected / clicked by the user. */
  EntitySelected = 'entitySelected',
  /** User submitted a form within the remote component. */
  EntitySubmitted = 'entitySubmitted',
  /** User explicitly cancelled an operation (e.g. closed a form). */
  EntityCancelled = 'entityCancelled',
  /** A generic error surfaced inside the remote component. */
  Error = 'error',
}

/**
 * Discriminated union of all events a remote component can emit.
 * Each member carries a strongly-typed `payload` so the host can
 * switch on `event` and get full type inference for `payload`.
 *
 * Remote components should emit these via `EventEmitter<IFederationOutputEvent>`
 * `@Output()` properties whose names match the `event` discriminant.
 */
export type IFederationOutputEvent =
  | {
      event: FederationOutputEventName.EntitySelected;
      payload: { entity: IBizEntity };
    }
  | {
      event: FederationOutputEventName.EntitySubmitted;
      payload: { entity: IBizEntity; isNew: boolean };
    }
  | {
      event: FederationOutputEventName.EntityCancelled;
      payload: { reason?: string };
    }
  | {
      event: FederationOutputEventName.Error;
      payload: { message: string; code?: string | number };
    };

// ---------------------------------------------------------------------------
// Combined Contract
// ---------------------------------------------------------------------------

/**
 * Full data contract that describes every public API point of a federated
 * remote component:
 *   - `inputs`  → what the HOST must provide
 *   - `outputs` → what the REMOTE may emit back to the host
 *
 * Remote component classes should implement this interface to get
 * compile-time assurance that they honour the contract.
 *
 * @example
 * ```ts
 * // Inside the remote Angular component
 * import {
 *   IFederationContract,
 *   IBizEntityInput,
 *   IFederationOutputEvent,
 *   FederationOutputEventName,
 * } from '@your-org/federation-contract';
 *
 * export class EntityFormComponent implements IFederationContract {
 *   @Input() entity!: IBizEntityInput;  // IBizEntity | IBizEntity[]
 *
 *   @Output() [FederationOutputEventName.EntitySubmitted] =
 *     new EventEmitter<IFederationOutputEvent & { event: FederationOutputEventName.EntitySubmitted }>();
 *
 *   @Output() [FederationOutputEventName.EntityCancelled] =
 *     new EventEmitter<IFederationOutputEvent & { event: FederationOutputEventName.EntityCancelled }>();
 * }
 *
 * // Inside the host
 * onComponentEvent(e: IFederationOutputEvent): void {
 *   switch (e.event) {
 *     case FederationOutputEventName.EntitySubmitted:
 *       console.log(e.payload.entity, e.payload.isNew); // fully typed
 *       break;
 *     case FederationOutputEventName.Error:
 *       console.error(e.payload.message);
 *       break;
 *   }
 * }
 * ```
 */
export interface IFederationContract {
  /** Inputs the host will set via `ComponentRef.setInput()`. */
  inputs: IFederationInputs;
  /** Typed output events the remote component may emit. */
  outputs: IFederationOutputEvent;
}
