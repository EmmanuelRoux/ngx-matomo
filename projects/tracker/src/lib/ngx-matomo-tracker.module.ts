import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { MATOMO_CONFIGURATION, MatomoConfiguration } from './configuration';
import { MatomoOptOutFormComponent } from './directives/matomo-opt-out-form.component';
import { MatomoTrackClickDirective } from './directives/matomo-track-click.directive';
import { MatomoTrackerDirective } from './directives/matomo-tracker.directive';
import { MatomoInitializerService } from './matomo-initializer.service';

@NgModule({
  declarations: [MatomoTrackerDirective, MatomoTrackClickDirective, MatomoOptOutFormComponent],
  exports: [MatomoTrackerDirective, MatomoTrackClickDirective, MatomoOptOutFormComponent],
})
export class NgxMatomoTrackerModule {
  constructor(
    private readonly initializer: MatomoInitializerService,
    @Optional() @SkipSelf() parent?: NgxMatomoTrackerModule
  ) {
    if (!parent) {
      // Do not initialize if it is already (by a parent module)
      this.initializer.init();
    }
  }

  static forRoot(config: MatomoConfiguration): ModuleWithProviders<NgxMatomoTrackerModule> {
    return {
      ngModule: NgxMatomoTrackerModule,
      providers: [{ provide: MATOMO_CONFIGURATION, useValue: config }],
    };
  }
}