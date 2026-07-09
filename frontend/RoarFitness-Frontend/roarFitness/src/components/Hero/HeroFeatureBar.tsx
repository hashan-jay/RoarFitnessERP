import { HERO_FEATURE_TICKER } from './constants'

const tickerItems = [...HERO_FEATURE_TICKER, ...HERO_FEATURE_TICKER]

/** Slim live strap — scrolling ticker pinned to the hero bottom edge */
export function HeroFeatureBar() {
  return (
    <div className="hero-editorial__strap" aria-hidden="true">
      <div className="hero-editorial__strap-live">
        <span className="hero-editorial__strap-dot" />
        LIVE
      </div>
      <div className="hero-editorial__strap-ticker">
        <div className="hero-editorial__strap-track">
          {tickerItems.map((item, index) => (
            <span key={`${item}-${index}`} className="hero-editorial__strap-item">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
