import { initFederation } from '@angular-architects/native-federation';

// Pre-register all known remotes from the registry server.
// This sets up the import map with scoped entries so shared
// Angular packages resolve correctly for each remote.
initFederation('http://localhost:3000/components/federation-manifest')
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
