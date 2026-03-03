/**
 * TypeScript type definitions for chrome-extension-cli
 * npm package: chrome-extension-cli
 * GitHub: dutiyesh/chrome-extension-cli
 */

export interface AppDetails {
  name: string;
  description?: string;
}

export interface TSConfig {
  compilerOptions: {
    rootDir: string;
    target: string;
    module: string;
    esModuleInterop: boolean;
    strict: boolean;
  };
}

/**
 * Valid language options for the generated extension
 */
export type Language = 'javascript' | 'typescript';

/**
 * Valid override page options
 */
export type OverridePage = 'newtab' | 'bookmarks' | 'history';

/**
 * Validates if the given name is a valid npm package name.
 * Exits process with error if invalid.
 * @param name - The project name to validate
 */
export function checkAppName(name: string): void;

/**
 * Formats a project name for display (human-readable)
 * @param name - The project name (kebab-case or similar)
 * @returns Human-readable name
 */
export function prettifyAppName(name: string): string;

/**
 * Generates a README.md file for the extension project
 * @param appDetails - Object containing app name and description
 * @param appPath - Path where the README should be generated
 * @returns true if README was generated successfully
 */
export function generateReadme(appDetails: AppDetails, appPath: string): boolean;

/**
 * Attempts to initialize a git repository in the given path
 * @param appPath - Path to initialize git repository
 * @returns true if git was initialized successfully, false otherwise
 */
export function tryGitInit(appPath: string): boolean;

/**
 * Supported languages for generated extension
 */
export const LANGUAGES: Language[];

/**
 * Supported override pages for Chrome extensions
 */
export const OVERRIDE_PAGES: OverridePage[];

/**
 * Default TypeScript configuration for generated projects
 */
export const TS_CONFIG: TSConfig;

/**
 * CLI program instance (from commander)
 */
export const program: any;
