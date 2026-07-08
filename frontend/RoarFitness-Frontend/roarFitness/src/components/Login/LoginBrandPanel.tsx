import { showcaseSlide1 } from '../../assets/images/showcase'
import { AuthBrandPanel } from '../auth/AuthBrandPanel'
import { LOGIN_COPY } from './constants'

/** Login brand panel — thin wrapper around shared auth panel */
export function LoginBrandPanel() {
  return <AuthBrandPanel copy={LOGIN_COPY} imageSrc={showcaseSlide1} />
}
