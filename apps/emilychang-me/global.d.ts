export { };

// Declaration for .glb files (3D model assets)
declare module '*.glb' {
  const value: string;
  export default value;
}

// Declaration for .png files
declare module '*.png' {
  const value: string;
  export default value;
}

// Declaration for meshline library
declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

// Declaration for JSX intrinsic elements used by meshline
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}
