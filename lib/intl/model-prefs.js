import { CodeBuddyCliError } from './cli-response.js'
import { createModelPrefsModule } from '../shared/model-prefs.js'

export const { preferencesDirectory, validModelId, createModelPrefs } = createModelPrefsModule({
  defaultRegion: 'intl',
  CodeBuddyCliError
})
