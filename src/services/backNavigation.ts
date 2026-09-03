// Hartbeesfontein Veiligheid - Mobile Phone Hardware & Browser Back Button Manager
// Handles Android/iOS gesture navigation, browser back buttons, and PWA hardware back buttons.

export interface BackHandlerOptions {
  id?: string;
  name: string;
  onBack: () => void;
  priority?: number;
}

interface StackEntry {
  id: string;
  name: string;
  onBack: () => void;
  priority: number;
  historyPushed: boolean;
}

class BackNavigationManager {
  private stack: StackEntry[] = [];
  private isInitialized = false;
  private isProcessingPop = false;
  private suppressPopCount = 0;
  private rootInitialized = false;

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Set initial root state if not already set
    try {
      if (!window.history.state || !window.history.state.__hvRoot) {
        window.history.replaceState({ __hvRoot: true, timestamp: Date.now() }, '');
      }
      this.rootInitialized = true;
    } catch (e) {
      console.debug('Failed to initialize root history state:', e);
    }

    window.addEventListener('popstate', this.handlePopState);
  }

  private handlePopState = (e: PopStateEvent): void => {
    if (this.suppressPopCount > 0) {
      this.suppressPopCount--;
      return;
    }

    if (this.stack.length === 0) {
      // At root - allow default browser back behavior
      return;
    }

    this.isProcessingPop = true;

    // Pop the topmost handler
    const topEntry = this.stack.pop();
    if (topEntry) {
      try {
        topEntry.onBack();
      } catch (err) {
        console.error(`Error executing back handler "${topEntry.name}":`, err);
      }
    }

    this.isProcessingPop = false;
  };

  /**
   * Register a back action (e.g. closing a modal, deselecting a case, or navigating back from a sub-tab)
   */
  public push(options: BackHandlerOptions): string {
    this.init();

    const id = options.id || `bh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const priority = options.priority || 0;

    // Check if handler with this ID already exists
    const existingIdx = this.stack.findIndex((s) => s.id === id);
    if (existingIdx !== -1) {
      this.stack[existingIdx].onBack = options.onBack;
      return id;
    }

    let historyPushed = false;
    try {
      window.history.pushState({ __hvBackId: id, name: options.name }, '');
      historyPushed = true;
    } catch (e) {
      console.debug('Failed to push history state for back button:', e);
    }

    const entry: StackEntry = {
      id,
      name: options.name,
      onBack: options.onBack,
      priority,
      historyPushed,
    };

    this.stack.push(entry);
    return id;
  }

  /**
   * Remove a back action when closed via UI button (instead of hardware back button)
   */
  public pop(id: string): void {
    const idx = this.stack.findIndex((s) => s.id === id);
    if (idx === -1) return;

    const [entry] = this.stack.splice(idx, 1);

    // If this was closed via in-app UI and it had pushed a history state,
    // we should safely pop the browser history so we don't leave phantom forward/back entries.
    if (entry && entry.historyPushed && !this.isProcessingPop) {
      try {
        this.suppressPopCount++;
        window.history.back();
      } catch (e) {
        this.suppressPopCount = Math.max(0, this.suppressPopCount - 1);
      }
    }
  }

  /**
   * Clear all handlers matching a prefix or all handlers
   */
  public clear(prefix?: string): void {
    if (!prefix) {
      while (this.stack.length > 0) {
        const top = this.stack.pop();
        if (top && top.historyPushed && !this.isProcessingPop) {
          try {
            this.suppressPopCount++;
            window.history.back();
          } catch (e) {
            this.suppressPopCount = Math.max(0, this.suppressPopCount - 1);
          }
        }
      }
    } else {
      const remaining: StackEntry[] = [];
      for (const entry of this.stack) {
        if (entry.id.startsWith(prefix) || entry.name.startsWith(prefix)) {
          if (entry.historyPushed && !this.isProcessingPop) {
            try {
              this.suppressPopCount++;
              window.history.back();
            } catch (e) {
              this.suppressPopCount = Math.max(0, this.suppressPopCount - 1);
            }
          }
        } else {
          remaining.push(entry);
        }
      }
      this.stack = remaining;
    }
  }

  public getStackDepth(): number {
    return this.stack.length;
  }
}

export const backNavigation = new BackNavigationManager();
export default backNavigation;
