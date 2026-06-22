import path from "node:path";

export const PACKAGE_PLATFORM = "win32";
export const PACKAGE_ARCH = "x64";
export const PACKAGE_BASENAME = "SatisfactorySaveMapUploader";

export function getForgePackageDirectory(packageJson, root = "") {
  return path.join(root, "out", `${packageJson.productName}-${PACKAGE_PLATFORM}-${PACKAGE_ARCH}`);
}

export function getExpectedPackageDirectory(packageJson, root = "") {
  return path.join(
    root,
    "out",
    `${PACKAGE_BASENAME}-Portable-${packageJson.version}-${PACKAGE_ARCH}`,
  );
}

export function getExpectedPackageExecutable(packageJson, root = "") {
  return path.join(getExpectedPackageDirectory(packageJson, root), `${PACKAGE_BASENAME}.exe`);
}
