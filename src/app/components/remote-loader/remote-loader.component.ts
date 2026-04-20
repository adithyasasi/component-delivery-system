import {
    AfterViewInit,
    Component,
    ComponentRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ComponentRegistryService } from '../../services/component-registry.service';
import {
    IFederationInputs,
    IFederationOutputEvent,
} from '../../contracts/federation-contract';

@Component({
    selector: 'app-remote-loader',
    standalone: true,
    templateUrl: './remote-loader.component.html',
    styleUrl: './remote-loader.component.css',
})
export class RemoteLoaderComponent implements OnChanges, AfterViewInit, OnDestroy {
    // UUID of the component to load from the registry server
    @Input() uuid!: string;

    // Complex input object to pass to the remote component's @Input() properties
    @Input() inputs: IFederationInputs = {} as IFederationInputs;

    // Bubbles up any @Output() EventEmitter from the remote component.
    // Strongly typed via the shared IFederationOutputEvent contract.
    @Output() componentEvent = new EventEmitter<IFederationOutputEvent>();

    @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

    loading = false;
    errorMessage: string | null = null;

    private componentRef: ComponentRef<unknown> | null = null;
    private outputSubscriptions: Subscription[] = [];
    private pendingLoad = false;
    private viewInitialized = false;

    constructor(private registryService: ComponentRegistryService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['uuid']) {
            if (this.viewInitialized) {
                this.loadComponent();
            } else {
                this.pendingLoad = true;
            }
        }

        // If only inputs changed (not UUID), update the already-mounted component instance
        if (changes['inputs'] && !changes['uuid'] && this.componentRef) {
            this.updateInputs();
        }
    }

    // ViewChild is not available until after view init — queue any early load requests
    ngAfterViewInit(): void {
        this.viewInitialized = true;
        if (this.pendingLoad) {
            this.loadComponent();
        }
    }

    private async loadComponent(): Promise<void> {
        if (!this.uuid) return;

        this.pendingLoad = false;
        this.loading = true;
        this.errorMessage = null;
        this.destroyComponent();

        try {
            const componentClass = await this.registryService.loadComponentClass(this.uuid);
            // console.log('[RemoteLoader] Component class loaded:', componentClass);
            this.container.clear();
            this.componentRef = this.container.createComponent(componentClass);
            // console.log('[RemoteLoader] Component instance created:', this.componentRef.instance);
            this.updateInputs();
            this.subscribeToOutputs();

            this.componentRef.changeDetectorRef.detectChanges();
        } catch (err: unknown) {
            this.errorMessage =
                err instanceof Error ? err.message : 'Unknown error loading component';
        } finally {
            this.loading = false;
        }
    }

    // Passes the inputs object key-by-key into the remote component instance
    private updateInputs(): void {
        if (!this.componentRef || !this.inputs) return;
        // console.log('[RemoteLoader] Updating inputs:', this.inputs);
        Object.entries(this.inputs).forEach(([key, value]) => {
            this.componentRef!.setInput(key, value);
        });
    }

    // Subscribes to all EventEmitter properties on the remote component instance
    // and re-emits them upward via componentEvent
    private subscribeToOutputs(): void {
        this.outputSubscriptions.forEach((s) => s.unsubscribe());
        this.outputSubscriptions = [];

        if (!this.componentRef) return;

        const instance = this.componentRef.instance as Record<string, any>;

        Object.keys(instance).forEach((key) => {
            const prop = instance[key];
            if (prop instanceof EventEmitter) {
                console.log(prop);
                const sub = prop.subscribe((payload: unknown) => {
                    // Cast to the shared contract type — the remote is expected
                    // to emit events that conform to IFederationOutputEvent.
                    this.componentEvent.emit(
                        { event: key, payload } as IFederationOutputEvent
                    );
                });
                this.outputSubscriptions.push(sub);
            }
        });
    }

    private destroyComponent(): void {
        this.outputSubscriptions.forEach((s) => s.unsubscribe());
        this.outputSubscriptions = [];
        this.componentRef?.destroy();
        this.componentRef = null;
        this.container?.clear();
    }

    ngOnDestroy(): void {
        this.destroyComponent();
    }
}
