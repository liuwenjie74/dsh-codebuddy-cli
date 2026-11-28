import { isLoopbackHost, trustedLocalRequest, readLocalJson as sharedReadLocalJson, readAction as sharedReadAction } from '../shared/local-http.js'

export { isLoopbackHost, trustedLocalRequest }
export const readLocalJson = (req, maxBytes = 262144) => sharedReadLocalJson(req, maxBytes, 'invalid-json')
export const readAction = (req, allowed = ['setup', 'refreshModels']) => sharedReadAction(req, allowed, 'invalid-json')
