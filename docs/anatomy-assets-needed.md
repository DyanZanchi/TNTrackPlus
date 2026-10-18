# Anatomy assets needed

TN Track+ currently has one working, approved front-facing face image at `public/images/face-map.png`. Its coordinate mapping and patient-left/right behavior must remain unchanged.

## Requested future views

- Front face
- Left profile
- Right profile
- Teeth/dental chart

Only assets that exist and have been explicitly approved may appear in the patient interface. A missing view must be hidden or labeled with plain text such as “Image coming soon.” Do not mirror the current image or generate substitute anatomy.

## Asset requirements

For each view, provide:

- A raster or reviewed vector asset with stable dimensions and aspect ratio
- Light-background and, if required, dark-background variants
- Source, ownership, license, and attribution
- Clinical reviewer and approval date
- Version identifier
- Patient-safe accessible description
- Explicit patient-left and patient-right labels
- The intended tooth-numbering convention for dental assets
- A separately reviewed hotspot/region map using stable anatomical region IDs

The region map must be authored or approved with the artwork. Engineering must not infer polygons from appearance.

## Registration shape

Future implementation should adapt this conceptual shape to repository conventions:

```ts
type FaceView = "front" | "left-profile" | "right-profile" | "teeth";

type AnatomyAsset = {
  view: FaceView;
  src: string;
  approved: boolean;
  version: string;
  sourceAttribution?: string;
  accessibleDescription: string;
  regionMap?: ApprovedRegionMap;
};
```

The selector should include only entries with `approved: true`, an available asset, and—when selection is supported—an approved region map.

## Review checklist

- [ ] Ownership and patient-facing use are authorized.
- [ ] Clinical reviewer approved anatomy and labels.
- [ ] Patient laterality is explicit and tested.
- [ ] Image is not a mirrored reuse of another view.
- [ ] Alt text is understandable without making diagnostic claims.
- [ ] Hotspots use stable region IDs across views.
- [ ] Tooth numbering is explicit and jurisdiction-appropriate.
- [ ] Keyboard and text-based selection alternatives are available.
- [ ] Stored records include asset view and version.
- [ ] Existing front-view records still render correctly.
- [ ] Mobile scaling does not move hotspots away from anatomy.

