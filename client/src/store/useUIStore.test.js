import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { useUIStore } from './useUIStore.js';

describe('useUIStore', () => {
  afterEach(() => {
    useUIStore.setState({ isSidebarCollapsed: false });
  });

  it('toggles the sidebar collapsed state', () => {
    useUIStore.getState().toggleSidebar();
    assert.equal(useUIStore.getState().isSidebarCollapsed, true);

    useUIStore.getState().toggleSidebar();
    assert.equal(useUIStore.getState().isSidebarCollapsed, false);
  });

  it('sets the sidebar collapsed state directly', () => {
    useUIStore.getState().setSidebarCollapsed(true);
    assert.equal(useUIStore.getState().isSidebarCollapsed, true);

    useUIStore.getState().setSidebarCollapsed(false);
    assert.equal(useUIStore.getState().isSidebarCollapsed, false);
  });
});
