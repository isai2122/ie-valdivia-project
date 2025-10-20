
// src/modules/Sync.js
// Handles synchronization of posts/banners across tabs and components.
// Listens to custom event 'app:postsUpdated' and to 'storage' events (for cross-tab updates).

function refreshAllViews() {
  // Try to re-render key components if available
  import('./PublishView.js').then(mod => { if (mod.renderPublishView) {
    try { mod.renderPublishView(); } catch(e){ console.warn('renderPublishView failed', e); }
  }}).catch(()=>{});

  import('./Banners.js').then(mod => { if (mod.renderBanners) {
    try { mod.renderBanners(); } catch(e){ console.warn('renderBanners failed', e); }
  }}).catch(()=>{});

  import('./Home.js').then(mod => { if (mod.renderHome) {
    try { const app = document.getElementById('app') || document.body; mod.renderHome(app); } catch(e){ console.warn('renderHome failed', e); }
  }}).catch(()=>{});
}

window.addEventListener('app:postsUpdated', () => {
  console.log('[Sync] app:postsUpdated received - refreshing views');
  refreshAllViews();
});

window.addEventListener('storage', (e) => {
  if (!e) return;
  if (e.key === 'posts' || e.key === 'posts_update_ts') {
    console.log('[Sync] storage event for posts - refreshing views');
    refreshAllViews();
  }
});

// Export nothing; module auto-activates when imported.
export default {};
