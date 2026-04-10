import * as i0 from '@angular/core';
import { Input, Component } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule, DatePipe } from '@angular/common';

class DeliverableDetailComponent {
    entity;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.18", ngImport: i0, type: DeliverableDetailComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.18", type: DeliverableDetailComponent, isStandalone: true, selector: "app-deliverable-detail", inputs: { entity: "entity" }, ngImport: i0, template: `
    <div class="biz-detail deliverable-detail">
      <div class="biz-detail__header">
        <span class="biz-detail__icon">📦</span>
        <div class="biz-detail__heading">
          <h2 class="biz-detail__title">{{ entity?.name }}</h2>
          <span class="biz-detail__short">{{ entity?.shortName }}</span>
        </div>
        <span class="biz-detail__badge" [class.draft]="entity?.draft">
          {{ entity?.draft ? 'Draft' : 'Active' }}
        </span>
      </div>

      <p class="biz-detail__desc">{{ entity?.description }}</p>

      <div class="biz-detail__section-label">Details</div>
      <div class="biz-detail__meta">
        <div class="biz-meta-row">
          <span class="biz-meta-label">Owner ID</span>
          <span>{{ entity?.ownerId }}</span>
        </div>
        <div class="biz-meta-row">
          <span class="biz-meta-label">Parent ID</span>
          <span>{{ entity?.parentId ?? '—' }}</span>
        </div>
        <div class="biz-meta-row">
          <span class="biz-meta-label">Archived</span>
          <span>{{ entity?.archived ? 'Yes' : 'No' }}</span>
        </div>
        <div class="biz-meta-row">
          <span class="biz-meta-label">Created</span>
          <span>{{ entity?.createdOn | date:'mediumDate' }}</span>
        </div>
        <div class="biz-meta-row">
          <span class="biz-meta-label">Modified</span>
          <span>{{ (entity?.modifiedOn | date:'mediumDate') ?? '—' }}</span>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".biz-detail{border:1px solid #e0e0e0;border-radius:10px;padding:24px;max-width:520px;font-family:sans-serif}.deliverable-detail{border-top:4px solid #2196f3}.biz-detail__header{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}.biz-detail__icon{font-size:2rem}.biz-detail__heading{flex:1}.biz-detail__title{margin:0 0 4px;font-size:1.3rem;color:#222}.biz-detail__short{font-size:.8rem;color:#aaa;text-transform:uppercase;letter-spacing:.05em}.biz-detail__badge{font-size:.75rem;padding:2px 10px;border-radius:999px;background:#e3f2fd;color:#1565c0;font-weight:600}.biz-detail__badge.draft{background:#fff8e1;color:#f9a825}.biz-detail__desc{color:#555;font-size:.95rem;margin:0 0 20px;line-height:1.5}.biz-detail__section-label{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#aaa;margin-bottom:8px}.biz-detail__meta{display:flex;flex-direction:column;gap:8px}.biz-meta-row{display:flex;justify-content:space-between;font-size:.9rem;padding:6px 0;border-bottom:1px solid #f5f5f5}.biz-meta-label{color:#888}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "pipe", type: i1.DatePipe, name: "date" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.18", ngImport: i0, type: DeliverableDetailComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-deliverable-detail', standalone: true, imports: [CommonModule, DatePipe], template: `
    <div class="biz-detail deliverable-detail">
      <div class="biz-detail__header">
        <span class="biz-detail__icon">📦</span>
        <div class="biz-detail__heading">
          <h2 class="biz-detail__title">{{ entity?.name }}</h2>
          <span class="biz-detail__short">{{ entity?.shortName }}</span>
        </div>
        <span class="biz-detail__badge" [class.draft]="entity?.draft">
          {{ entity?.draft ? 'Draft' : 'Active' }}
        </span>
      </div>

      <p class="biz-detail__desc">{{ entity?.description }}</p>

      <div class="biz-detail__section-label">Details</div>
      <div class="biz-detail__meta">
        <div class="biz-meta-row">
          <span class="biz-meta-label">Owner ID</span>
          <span>{{ entity?.ownerId }}</span>
        </div>
        <div class="biz-meta-row">
          <span class="biz-meta-label">Parent ID</span>
          <span>{{ entity?.parentId ?? '—' }}</span>
        </div>
        <div class="biz-meta-row">
          <span class="biz-meta-label">Archived</span>
          <span>{{ entity?.archived ? 'Yes' : 'No' }}</span>
        </div>
        <div class="biz-meta-row">
          <span class="biz-meta-label">Created</span>
          <span>{{ entity?.createdOn | date:'mediumDate' }}</span>
        </div>
        <div class="biz-meta-row">
          <span class="biz-meta-label">Modified</span>
          <span>{{ (entity?.modifiedOn | date:'mediumDate') ?? '—' }}</span>
        </div>
      </div>
    </div>
  `, styles: [".biz-detail{border:1px solid #e0e0e0;border-radius:10px;padding:24px;max-width:520px;font-family:sans-serif}.deliverable-detail{border-top:4px solid #2196f3}.biz-detail__header{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}.biz-detail__icon{font-size:2rem}.biz-detail__heading{flex:1}.biz-detail__title{margin:0 0 4px;font-size:1.3rem;color:#222}.biz-detail__short{font-size:.8rem;color:#aaa;text-transform:uppercase;letter-spacing:.05em}.biz-detail__badge{font-size:.75rem;padding:2px 10px;border-radius:999px;background:#e3f2fd;color:#1565c0;font-weight:600}.biz-detail__badge.draft{background:#fff8e1;color:#f9a825}.biz-detail__desc{color:#555;font-size:.95rem;margin:0 0 20px;line-height:1.5}.biz-detail__section-label{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#aaa;margin-bottom:8px}.biz-detail__meta{display:flex;flex-direction:column;gap:8px}.biz-meta-row{display:flex;justify-content:space-between;font-size:.9rem;padding:6px 0;border-bottom:1px solid #f5f5f5}.biz-meta-label{color:#888}\n"] }]
        }], propDecorators: { entity: [{
                type: Input
            }] } });

export { DeliverableDetailComponent };
//# sourceMappingURL=lazyloading-components-deliverable-detail.component-Dig0n9P7.mjs.map
