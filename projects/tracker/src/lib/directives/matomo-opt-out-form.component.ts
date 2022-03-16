import {
  Component,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnInit,
  Optional,
  SecurityContext,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { coerceCssSizeBinding, CssSizeInput } from '../coercion';
import {
  getTrackersConfiguration,
  INTERNAL_MATOMO_CONFIGURATION,
  InternalMatomoConfiguration,
  isExplicitTrackerConfiguration,
} from '../configuration';

const DEFAULT_BORDER = '0';
const DEFAULT_WIDTH = '600px';
const DEFAULT_HEIGHT = '200px';
const URL_PATTERN =
  '{SERVER}/index.php?module=CoreAdminHome&action=optOut&language={LOCALE}&backgroundColor={BG_COLOR}&fontColor={COLOR}&fontSize={FONT_SIZE}&fontFamily={FONT_FAMILY}';

function missingServerUrlError(): Error {
  return new Error(
    'It is required to set [serverUrl] when Matomo configuration mode is set to MANUAL'
  );
}

/**
 * Basic opt-out form, based on an iframe auto-generated by Matomo.
 *
 * <b>WARNING:</b> By default, this component assumes the tracker url set in MatomoConfiguration is
 * safe to be used as an iframe `src`. You have to make sure that this url is safe before using this
 * component!
 */
@Component({
  selector: 'matomo-opt-out-form',
  templateUrl: './matomo-opt-out-form.component.html',
})
export class MatomoOptOutFormComponent implements OnInit, OnChanges {
  private readonly _defaultServerUrl?: string;

  private _border: string = DEFAULT_BORDER;
  private _width: string = DEFAULT_WIDTH;
  private _height: string = DEFAULT_HEIGHT;
  private _iframeSrc: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  private _serverUrlOverride?: SafeResourceUrl;

  /**
   * Set a custom locale for the opt-out form
   * <br>
   * Default is the current app locale available in LOCALE_ID token
   */
  @Input() locale: string;
  /** Font color (note that Matomo currently only supports hexadecimal without leading hash notation) */
  @Input() color: string = '';
  /** Background color (note that Matomo currently only supports hexadecimal without leading hash notation) */
  @Input() backgroundColor: string = '';
  @Input() fontSize: string = '';
  @Input() fontFamily: string = '';

  constructor(
    private readonly sanitizer: DomSanitizer,
    @Inject(INTERNAL_MATOMO_CONFIGURATION) private readonly config: InternalMatomoConfiguration,
    @Optional() @Inject(LOCALE_ID) locale: string = ''
  ) {
    // Set default locale
    this.locale = locale;

    if (isExplicitTrackerConfiguration(this.config)) {
      this._defaultServerUrl = getTrackersConfiguration(this.config)[0].trackerUrl;
    }
  }

  get serverUrl(): SafeResourceUrl | undefined {
    return this._serverUrlOverride;
  }

  /**
   * Set a custom Matomo server url to be used for iframe generation
   * <br>
   * By default, tracker url is retrieved from MatomoConfiguration.
   * <br>
   * <b>WARNING:</b> This component assumes the url you provide is safe to be used as an iframe
   * `src`. You have to make sure that this url is safe before using this component!
   */
  @Input()
  set serverUrl(value: SafeResourceUrl | undefined) {
    this._serverUrlOverride = value;
  }

  get iframeSrc(): SafeResourceUrl | undefined {
    return this._iframeSrc;
  }

  get height(): string {
    return this._height;
  }

  @Input()
  set height(value: string) {
    this._height = coerceCssSizeBinding(value);
  }

  get width(): string {
    return this._width;
  }

  @Input()
  set width(value: string) {
    this._width = coerceCssSizeBinding(value);
  }

  get border(): string {
    return this._border;
  }

  @Input()
  set border(value: string) {
    this._border = coerceCssSizeBinding(value);
  }

  ngOnInit() {
    this.updateUrl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'serverUrl' in changes ||
      'locale' in changes ||
      'color' in changes ||
      'backgroundColor' in changes ||
      'fontSize' in changes ||
      'fontFamily' in changes
    ) {
      this.updateUrl();
    }
  }

  private updateUrl(): void {
    let serverUrl: string | null | undefined = this._defaultServerUrl;

    if (this._serverUrlOverride) {
      serverUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this._serverUrlOverride);
    }

    if (!serverUrl) {
      throw missingServerUrlError();
    }

    const url = URL_PATTERN.replace('{SERVER}', serverUrl)
      .replace('{LOCALE}', encodeURIComponent(this.locale))
      .replace('{COLOR}', encodeURIComponent(this.color))
      .replace('{BG_COLOR}', encodeURIComponent(this.backgroundColor))
      .replace('{FONT_SIZE}', encodeURIComponent(this.fontSize))
      .replace('{FONT_FAMILY}', encodeURIComponent(this.fontFamily));

    this._iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  static ngAcceptInputType_border: CssSizeInput;
  static ngAcceptInputType_width: CssSizeInput;
  static ngAcceptInputType_height: CssSizeInput;
}