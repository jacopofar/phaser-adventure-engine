export function resolvePath(basePath: string, path: string): string {
  // TODO normalize things like ../../aa/../ if possible
  // also, what to do with absolute paths?
  return basePath.slice(0, basePath.lastIndexOf("/") + 1) + path;
}
