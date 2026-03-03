/**
 * TypeScript type definitions for chrome-extension-cli
 */

export interface ChromeExtensionCliOptions {
  /**
   * Override default page like New Tab, Bookmarks, or History page
   * @example 'newtab', 'bookmarks', 'history'
   */
  overridePage?: 'newtab' | 'bookmarks' | 'history' | boolean;
  
  /**
   * Add features to Chrome Developer Tools
   */
  devtools?: boolean;
  
  /**
   * Add features to Chrome Side Panel
   */
  sidePanel?: boolean;
  
  /**
   * Language like JavaScript and TypeScript
   * @example 'javascript', 'typescript'
   */
  language?: 'javascript' | 'typescript';
}

export interface ChromeExtensionCLIPackage {
  /**
   * Package version
   */
  version: string;
  
  /**
   * Package name
   */
  name: string;
}

declare const program: ChromeExtensionCLIPackage & {
  /**
   * Initialize a new Chrome extension project
   * @param projectName - The name of the project directory
   * @param options - CLI options
   */
  (projectName: string, options?: ChromeExtensionCliOptions): void;
  
  /**
   * Available options
   */
  options(): ChromeExtensionCliOptions;
  
  /**
   * Output help information
   */
  helpInformation(): string;
};

export default program;
