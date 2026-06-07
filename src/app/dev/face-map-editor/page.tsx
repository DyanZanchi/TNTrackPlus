/** Dev-only face map calibrator — http://localhost:3000/dev/face-map-editor */
import { notFound } from "next/navigation";
import { FaceMapPolygonEditor } from "@/components/dev/face-map-polygon-editor";

export default function FaceMapEditorPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <FaceMapPolygonEditor />;
}
