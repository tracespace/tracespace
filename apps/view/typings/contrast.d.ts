// Type definitions for contrast 1.0
// Project: https://github.com/scottcorgan/contrast
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'contrast' {
  function contrast(color: string): 'light' | 'dark'

  export = contrast
}
